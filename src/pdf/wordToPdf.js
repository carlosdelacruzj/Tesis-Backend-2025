// src/pdf/wordToPdf.js (o como lo tengas)
// ✅ Centraliza ruta de LibreOffice (Windows/Mac/Linux) en 1 solo lugar
// ✅ Mantiene tus logs + fallback + espera de archivo

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFile } = require("child_process");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");

// --- Helpers ---
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForFile(filePath, timeoutMs = 8000, intervalMs = 200) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (fs.existsSync(filePath)) return true;
    await sleep(intervalMs);
  }
  return false;
}

function isWindowsAbs(p) {
  return /^[A-Za-z]:\\/.test(p);
}

function getSofficeCandidates() {
  // 1) Si lo setea el usuario por .env (recomendado)
  // Ej: LIBREOFFICE_PATH=/Applications/LibreOffice.app/Contents/MacOS/soffice
  // Ej: LIBREOFFICE_PATH=C:\Program Files\LibreOffice\program\soffice.com
  const envPath = process.env.LIBREOFFICE_PATH?.trim();
  if (envPath) return [envPath];

  // 2) Por plataforma
  if (process.platform === "darwin") {
    return [
      "/Applications/LibreOffice.app/Contents/MacOS/soffice",
      // fallback si el usuario lo tiene en PATH
      "soffice",
    ];
  }

  if (process.platform === "win32") {
    return [
      // tu ruta típica (64-bit)
      "C:\\Program Files\\LibreOffice\\program\\soffice.com",
      "C:\\Program Files\\LibreOffice\\program\\soffice.exe",
      // fallback 32-bit
      "C:\\Program Files (x86)\\LibreOffice\\program\\soffice.com",
      "C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe",
      // si lo agregan al PATH
      "soffice",
    ];
  }

  // Linux (normalmente en PATH)
  return ["soffice"];
}

// --- DOCX render ---
function renderDocxFromTemplate(templatePath, data) {
  if (!fs.existsSync(templatePath)) {
    const err = new Error(`Template DOCX no encontrado: ${templatePath}`);
    err.status = 500;
    throw err;
  }

  const content = fs.readFileSync(templatePath, "binary");
  const zip = new PizZip(content);

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    // ✅ Si falta un tag, lo deja vacío (evita que explote por campos opcionales)
    nullGetter: () => "",
  });

  try {
    doc.render(data);
  } catch (e) {
    // ✅ Docxtemplater "Multi error": lista de tags problemáticos
    const details = (e?.properties?.errors || []).map((er) => {
      const tag = er?.properties?.id || er?.properties?.tag || "";
      const explain = er?.properties?.explanation || er?.message || "";
      return `${tag}: ${explain}`.trim();
    });

    console.error("[docx] DOCXTEMPLATER ERROR:", details.length ? details : e);

    const err = new Error(
      `Plantilla DOCX con tags inválidos/missing. ` +
        (details.length ? details.join(" | ") : e.message)
    );
    err.status = 500;
    throw err;
  }

  return doc.getZip().generate({ type: "nodebuffer" });
}

// --- LibreOffice exec ---
function execSoffice(cmd, args) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { windowsHide: true }, (err, stdout, stderr) => {
      if (err) {
        err._stdout = stdout;
        err._stderr = stderr;
        return reject(err);
      }
      resolve({ stdout, stderr });
    });
  });
}

async function convertDocxToPdf(docxPath, outDir) {
  const args = ["--headless", "--convert-to", "pdf", "--outdir", outDir, docxPath];

  const candidates = getSofficeCandidates();

  const pdfPath = path.join(
    outDir,
    path.basename(docxPath, path.extname(docxPath)) + ".pdf"
  );

  let lastErr = null;

  for (const cmd of candidates) {
    try {
      // si es ruta absoluta en Windows o Unix, valida existencia
      const isAbs = path.isAbsolute(cmd) || isWindowsAbs(cmd);
      if (isAbs && !fs.existsSync(cmd)) continue;

      console.log("[pdf] intentando convertir con:", cmd);
      await execSoffice(cmd, args);

      // ✅ A veces LibreOffice demora un poquito en escribir el archivo
      const ok = await waitForFile(pdfPath, 8000, 200);
      if (!ok) {
        throw new Error("LibreOffice corrió pero no se encontró el PDF generado (timeout).");
      }

      console.log("[pdf] generado:", pdfPath);
      return pdfPath;
    } catch (err) {
      lastErr = err;
      console.error(
        "[pdf] fallo con:",
        cmd,
        "|",
        err?.message,
        err?._stderr ? `| stderr: ${String(err._stderr).slice(0, 300)}` : ""
      );
    }
  }

  const platformHint =
    process.platform === "darwin"
      ? "En Mac suele ser: /Applications/LibreOffice.app/Contents/MacOS/soffice"
      : process.platform === "win32"
      ? "En Windows suele ser: C:\\Program Files\\LibreOffice\\program\\soffice.com"
      : "En Linux suele estar en PATH: soffice";

  const hint =
    "No se pudo ejecutar LibreOffice (soffice). " +
    `Verifica instalación o define LIBREOFFICE_PATH en .env. ${platformHint}`;

  const e = new Error(`${lastErr?.message || "spawn soffice ENOENT"} | ${hint}`);
  e.status = 500;
  throw e;
}

// --- Public API ---
async function generatePdfBufferFromDocxTemplate({ templatePath, data }) {
  const tmpDir = path.join(os.tmpdir(), "tesis-docs");
  fs.mkdirSync(tmpDir, { recursive: true });

  const baseName = `doc_${Date.now()}`;
  const docxPath = path.join(tmpDir, `${baseName}.docx`);

  const docxBuffer = renderDocxFromTemplate(templatePath, data);
  fs.writeFileSync(docxPath, docxBuffer);

  let pdfPath = null;
  try {
    pdfPath = await convertDocxToPdf(docxPath, tmpDir);
    const pdfBuffer = fs.readFileSync(pdfPath);
    return pdfBuffer;
  } finally {
    // limpieza segura
    try {
      if (fs.existsSync(docxPath)) fs.unlinkSync(docxPath);
    } catch {}
    try {
      if (pdfPath && fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
    } catch {}
  }
}

module.exports = { generatePdfBufferFromDocxTemplate };