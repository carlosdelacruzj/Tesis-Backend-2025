// src/app.js
require("dotenv").config();

const fs = require("fs");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const pinoHttp = require("pino-http");
const PDFDocument = require("pdfkit");

const app = express();

const pool = require("./db");
const logger = require("./utils/logger");
const authMiddleware = require("./middlewares/auth");
const errorHandler = require("./middlewares/error-handler");
const basicAuth = require("./middlewares/basic-auth");

// ───────────────────────── Bootstrap FS ────────────────────
try { fs.mkdirSync("uploads", { recursive: true }); } catch (_) {}

const PORT = Number(process.env.PORT || 3000);
app.set("port", PORT);

// Desactiva ETag para evitar 304 en recursos de prueba
app.set("etag", false);

// ───────────────────────── Seguridad / CORS ────────────────
app.use(helmet({ contentSecurityPolicy: false }));

const origins = (process.env.CORS_ORIGINS || "http://localhost:4200")
  .split(",").map((s) => s.trim()).filter(Boolean);

app.use(cors({
  origin: origins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
  credentials: true,
}));

// ───────────────────────── Parsers / Logs ──────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(pinoHttp({
  logger,
  serializers: {
    req(req) { return { method: req.method, url: req.url }; },
    res(res) { return { statusCode: res.statusCode }; },
  },
  customSuccessMessage(req, res) { return `${req.method} ${req.url} → ${res.statusCode}`; },
  customErrorMessage(req, res, err) { return `ERROR ${req.method} ${req.url} → ${res.statusCode}: ${err.message}`; },
}));

// ───────────────────────── Rate limit ──────────────────────
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.RATE_LIMIT_MAX || 100),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) =>
    req.path === "/health" ||
    req.path === "/" ||
    req.path.startsWith("/api-doc") ||
    req.path === "/api-doc.json",
});
app.use(limiter);

// ───────────────────────── Health / Root ───────────────────
app.get("/", (_req, res) => res.status(200).send("OK"));

app.get("/health", async (_req, res) => {
  const start = Date.now();
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "up", latency_ms: Date.now() - start });
  } catch (err) {
    res.status(503).json({
      status: "degraded",
      db: "down",
      latency_ms: Date.now() - start,
      error: err.message,
    });
  }
});

// ───────────────────────── Helpers SQL ─────────────────────
async function qOne(sql, params = []) {
  const r = await pool.query(sql, params);
  const rows = Array.isArray(r?.[0]) ? r[0] : r;
  return rows?.[0] ?? null;
}
async function qAll(sql, params = []) {
  const r = await pool.query(sql, params);
  return Array.isArray(r?.[0]) ? r[0] : r;
}

// ───────────────────────── DEBUG BD & DATA ─────────────────
app.get("/debug/db", async (_req, res) => {
  try {
    const info = await qOne("SELECT DATABASE() AS db, USER() AS user");
    const srv  = await qOne("SELECT @@hostname AS hostname, @@version AS version");
    res.json({
      env: {
        DB_HOST: process.env.DB_HOST || null,
        DB_PORT: process.env.DB_PORT || null,
        DB_NAME: process.env.DB_NAME || null,
        NODE_ENV: process.env.NODE_ENV || null,
      },
      db: info,
      server: srv,
    });
  } catch (err) {
    res.status(500).json({ error: "No se pudo leer información de BD", detail: err.message });
  }
});

app.get("/debug/cotizaciones/snapshot", async (_req, res) => {
  try {
    const countRow = await qOne("SELECT COUNT(*) AS total FROM T_Cotizacion");
    const rows = await qAll(`
      SELECT
        c.PK_Cot_Cod      AS id,
        c.Cot_Estado      AS estado,
        c.Cot_TipoEvento  AS tipoEvento,
        c.Cot_Fecha_Crea  AS fechaCreacion,
        l.Lead_Nombre     AS leadNombre,
        l.Lead_Celular    AS leadCelular
      FROM T_Cotizacion c
      LEFT JOIN T_Lead l ON l.PK_Lead_Cod = c.FK_Lead_Cod
      ORDER BY c.Cot_Fecha_Crea DESC, c.PK_Cot_Cod DESC
      LIMIT 10
    `);
    res.json({ total: countRow?.total ?? 0, sample: rows });
  } catch (err) {
    res.status(500).json({ error: "No se pudo obtener snapshot de cotizaciones", detail: err.message });
  }
});

// ───────────────────────── DEBUG: PDFs válidos ─────────────
app.get("/debug/pdf", (_req, res) => {
  const base64 =
    "JVBERi0xLjQKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHMgWzMgMCBSXT4+ZW5kb2JqCjMgMCBvYmo8PC9UeXBlL1BhZ2UvUGFyZW50IDIgMCBSL01lZGlhQm94WzAgMCA1OTUuMjggODQxLjg5XTw8L0NvbnRlbnRzIDQgMCBSPj5lbmRvYmoKNCAwIG9iajw8L0xlbmd0aCAzNj4+CnN0cmVhbQpCVAovRjEgMTIgVGYKMTAwIDEwMCBUZAooSG9sYSwgQnJ1bm8g4pyJKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA1CjAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwNzYgMDAwMDAgbiAKMDAwMDAwMDE3IDAwMDAwIG4gCjAwMDAwMDE0MiAwMDAwMCBuIAowMDAwMDAyMDYgMDAwMDAgbiAKdHJhaWxlcjw8L1NpemUgNS9Sb290IDEgMCBSPj4Kc3RhcnR4cmVmCjI1NQolJUVPRg==";
  const pdfBuffer = Buffer.from(base64, "base64");
  res.status(200);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'inline; filename="ok.pdf"');
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.end(pdfBuffer);
});

app.get("/debug/pdfkit", (_req, res) => {
  res.status(200);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'inline; filename="pdfkit.pdf"');
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  const doc = new PDFDocument({ size: "A4", margin: 56 });
  doc.pipe(res);
  doc.fontSize(22).text("Hola, Bruno 👋", { align: "left" });
  doc.moveDown().fontSize(12).text("Si ves este PDF, el backend está enviando bytes correctamente.");
  doc.end();
});

// ───────────── Listado para grilla (solo columnas T_Cotizacion) ─────────────
app.get("/api/v1/cotizaciones-grid", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page ?? "1", 10), 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize ?? "10", 10), 1), 100);
    const q = (req.query.q ?? "").trim();

    const where = [];
    const params = [];
    if (q) {
      where.push(`(
        l.Lead_Nombre LIKE ? OR
        c.Cot_TipoEvento LIKE ? OR
        CONCAT('COT-', LPAD(c.PK_Cot_Cod, 3, '0')) LIKE ?
      )`);
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const countRow = await qOne(
      `SELECT COUNT(*) AS total
         FROM T_Cotizacion c
         LEFT JOIN T_Lead l ON l.PK_Lead_Cod = c.FK_Lead_Cod
        ${whereSql}`,
      params
    );
    const total = countRow?.total ?? 0;

    const offset = (page - 1) * pageSize;
    const rows = await qAll(
      `
      SELECT
        c.PK_Cot_Cod                                   AS id,
        CONCAT('COT-', LPAD(c.PK_Cot_Cod, 3, '0'))     AS code,
        l.Lead_Nombre                                  AS cliente,
        c.Cot_TipoEvento                               AS tipoEvento,
        c.Cot_FechaEvento                              AS fechaEvento,
        c.Cot_Lugar                                    AS lugar,
        c.Cot_HorasEst                                 AS horas,
        c.Cot_Mensaje                                  AS mensaje,
        c.Cot_Estado                                   AS estado,
        c.Cot_Fecha_Crea                               AS fechaCreacion,
        c.Cot_IdTipoEvento                             AS idTipoEvento
      FROM T_Cotizacion c
      LEFT JOIN T_Lead l ON l.PK_Lead_Cod = c.FK_Lead_Cod
      ${whereSql}
      ORDER BY c.Cot_Fecha_Crea DESC, c.PK_Cot_Cod DESC
      LIMIT ? OFFSET ?
      `,
      [...params, pageSize, offset]
    );

    const items = rows.map(r => ({
      id: r.id,
      code: r.code,
      cliente: r.cliente ?? "",
      servicio: "",                 // no existe en T_Cotizacion
      evento: r.tipoEvento ?? "",
      fecha: r.fechaEvento,
      horas: r.horas ?? null,
      estado: r.estado ?? "",
      total: 0,
      lugar: r.lugar ?? "",
      mensaje: r.mensaje ?? "",
      fechaCreacion: r.fechaCreacion,
      idTipoEvento: r.idTipoEvento ?? null,
    }));

    res.json({
      page,
      pageSize,
      total,
      pages: Math.max(Math.ceil(total / pageSize), 1),
      items,
    });
  } catch (err) {
    res.status(500).json({ error: "No se pudo obtener cotizaciones", detail: err.message });
  }
});

// ─────────────────────── PDF: opciones dinámicas (0..N) ─────────────────────
function fmtMoney(n, currency = "USD") {
  const v = Number(n || 0);
  const [i, d] = v.toFixed(2).split(".");
  return `${currency === "USD" ? "US $" : ""}${i.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${d}`;
}
function dotsLine(doc, label, amount, currency = "USD") {
  const left = 60, right = doc.page.width - 60;
  const dots = ".".repeat(120);
  const y = doc.y;
  doc.font("Helvetica").fontSize(11).text(`${label} ${dots}`, left, y, { lineBreak: false });
  const txt = fmtMoney(amount, currency);
  const w = doc.widthOfString(txt);
  doc.text(txt, right - w, y, { lineBreak: true }).moveDown(0.5);
}
function rule(doc, yPad = 6) {
  const x0 = 50, x1 = doc.page.width - 50, y = doc.y + yPad;
  doc.moveTo(x0, y).lineTo(x1, y).lineWidth(0.5).strokeColor("#333").stroke().moveDown(0.3);
}
function ensureArray(a) { return Array.isArray(a) ? a : (a ? [a] : []); }

function renderOption(doc, idx, opt) {
  doc.font("Helvetica-Bold").fontSize(12).text(`Opción ${idx}.`);
  doc.font("Helvetica").fontSize(11);
  if (opt.titulo) doc.text(`— ${opt.titulo}`);
  const bullets = [
    ...(ensureArray(opt.bullets)),
    opt.horas ? `Tiempo de trabajo: ${opt.horas} horas` : null,
  ].filter(Boolean);
  bullets.forEach(b => doc.text(`-  ${b}`));
  if (opt.notas) doc.text(`* Notas: ${opt.notas}`, { oblique: true });
  const total = Number(opt.precioUnitario || 0) * Number(opt.cantidad || 1);
  doc.moveDown(0.5);
  dotsLine(doc, "Costo por el servicio", total, opt.moneda || "USD");
  doc.moveDown(0.5);
}
function renderCategory(doc, titulo, opciones, totalLabel) {
  doc.font("Helvetica-Bold").fontSize(12).text(titulo).moveDown(0.4);
  rule(doc, 4);
  if (!opciones || opciones.length === 0) {
    doc.font("Helvetica-Oblique").fontSize(11)
      .text(`No se seleccionaron opciones de ${/foto/i.test(titulo) ? "fotografía" : "video"}.`)
      .moveDown(0.8);
    return;
  }
  let idx = 1;
  opciones.forEach(o => renderOption(doc, idx++, o));
  const moneda = (opciones[0] && opciones[0].moneda) || "USD";
  const total = opciones.reduce((s, o) => s + (Number(o.precioUnitario || 0) * Number(o.cantidad || 1)), 0);
  dotsLine(doc, totalLabel, total, moneda);
  doc.moveDown(1);
}

async function cargarSeleccionesDinamicas(cotId) {
  // Intenta leer de posibles tablas de “opciones/servicios” si existen.
  // Si no existen, devuelve arreglos vacíos y el PDF mostrará los mensajes de “no seleccionadas”.
  try {
    // ¿Existe T_CotizacionOpcion?
    const tOpcion = await qOne(`
      SELECT COUNT(*) AS n FROM information_schema.tables
      WHERE table_schema = DATABASE() AND table_name = 'T_CotizacionOpcion'
    `);
    if (tOpcion?.n > 0) {
      const rows = await qAll(`
        SELECT
          Categoria      AS categoria,         -- 'video' | 'foto'
          Titulo         AS titulo,
          Bullets        AS bulletsJson,       -- JSON opcional
          Horas          AS horas,
          Notas          AS notas,
          Cantidad       AS cantidad,
          PrecioUnitario AS precioUnitario,
          Moneda         AS moneda
        FROM T_CotizacionOpcion
        WHERE FK_Cot_Cod = ?
        ORDER BY PK_CotOpc_Cod ASC
      `, [cotId]);

      const parsed = rows.map(r => ({
        categoria: (r.categoria || "").toLowerCase().includes("vid") ? "video"
                  : (r.categoria || "").toLowerCase().includes("fot") ? "foto" : "otro",
        titulo: r.titulo || "",
        bullets: (() => { try { return JSON.parse(r.bulletsJson || "[]"); } catch { return []; } })(),
        horas: r.horas ?? null,
        notas: r.notas || "",
        cantidad: r.cantidad ?? 1,
        precioUnitario: r.precioUnitario ?? 0,
        moneda: r.moneda || "USD",
      }));

      return {
        foto:  parsed.filter(x => x.categoria === "foto"),
        video: parsed.filter(x => x.categoria === "video"),
      };
    }

    // ¿Existe T_CotizacionServicio? (fallback heurístico por título)
    const tServ = await qOne(`
      SELECT COUNT(*) AS n FROM information_schema.tables
      WHERE table_schema = DATABASE() AND table_name = 'T_CotizacionServicio'
    `);
    if (tServ?.n > 0) {
      const rows = await qAll(`
        SELECT
          CotServ_Titulo       AS titulo,
          CotServ_Descripcion  AS descTxt,
          CotServ_Cantidad     AS cantidad,
          CotServ_PrecioUnit   AS precioUnitario,
          CotServ_Moneda       AS moneda
        FROM T_CotizacionServicio
        WHERE FK_Cot_Cod = ?
        ORDER BY PK_CotServ_Cod ASC
      `, [cotId]);

      const mapRow = (r) => {
        const desc = r.descTxt || "";
        const bullets = desc ? desc.split(/\r?\n/).map(s => s.trim()).filter(Boolean) : [];
        const cat = /vid(eo)?|film/i.test(r.titulo || "") ? "video"
                  : /foto/i.test(r.titulo || "") ? "foto" : "otro";
        return {
          categoria: cat,
          titulo: r.titulo || "",
          bullets,
          horas: null,
          notas: "",
          cantidad: r.cantidad ?? 1,
          precioUnitario: r.precioUnitario ?? 0,
          moneda: r.moneda || "USD",
        };
      };

      const parsed = rows.map(mapRow);
      return {
        foto:  parsed.filter(x => x.categoria === "foto"),
        video: parsed.filter(x => x.categoria === "video"),
      };
    }

    // Si no hay tablas conocidas → vacío
    return { foto: [], video: [] };
  } catch (e) {
    logger.warn({ err: e.message }, "cargarSeleccionesDinamicas fallo");
    return { foto: [], video: [] };
  }
}

async function generarPdfCotizacion(cabecera, selecciones) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks = [];
    doc.on("data", c => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header
    doc.font("Helvetica-Bold").fontSize(18).text("Presupuesto fotografía y video", { align: "center" }).moveDown(1);
    doc.font("Helvetica").fontSize(11);
    if (cabecera.atencion) doc.text(`Atención:  ${cabecera.atencion}`);
    if (cabecera.mensajeIntro) doc.moveDown(0.5).text(cabecera.mensajeIntro);
    if (cabecera.lugarFecha) doc.moveDown(0.5).text(cabecera.lugarFecha);
    doc.moveDown(1);

    // 1) Fotografía (dinámico)
    renderCategory(doc, "1.-  Fotografía", selecciones.foto || [], "Total servicio fotografía");

    // 2) Video (dinámico)
    renderCategory(doc, "2.-  Servicio de filmación - 35 mm y sistema 4K", selecciones.video || [], "Total servicio video");

    // Footer
    doc.font("Helvetica").fontSize(10)
      .text("Estos precios no incluyen el I.G.V", { align: "left" })
      .text("Forma de pago 60% al firmar el contrato, saldo días antes del evento.", { align: "left" })
      .moveDown(1.2)
      .text("Sin otro en particular nos despedimos agradeciendo de antemano por la confianza recibida.", { align: "left" })
      .moveDown(1.2)
      .text("Atte", { align: "center" })
      .text("Edwin De La Cruz", { align: "center" })
      .text("fotógrafo", { align: "center" });

    doc.end();
  });
}

// Endpoint FINAL de PDF dinámico
/* app.get("/api/v1/cotizaciones/:id/pdf", async (req, res) => {
  try {
    const id = Number(req.params.id);

    // Cabecera desde tus tablas principales
    const cab = await qOne(`
      SELECT c.PK_Cot_Cod AS id, l.Lead_Nombre AS cliente, c.Cot_Lugar AS lugar, c.Cot_FechaEvento AS fecha
      FROM T_Cotizacion c
      LEFT JOIN T_Lead l ON l.PK_Lead_Cod = c.FK_Lead_Cod
      WHERE c.PK_Cot_Cod = ?
    `, [id]) || {};

    const cabecera = {
      atencion: cab.cliente || "Cliente",
      lugarFecha: cab.fecha ? `Se realizará el ${new Date(cab.fecha).toLocaleDateString()}${cab.lugar ? `, ${cab.lugar}` : ""}` : (cab.lugar || ""),
      mensajeIntro: "Cotización para realización de fotografía y video.",
    };

    // Carga dinámica de opciones (0..N por categoría)
    const selecciones = await cargarSeleccionesDinamicas(id);

    const pdfBuffer = await generarPdfCotizacion(cabecera, selecciones);
    res.status(200);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="COT-${String(id).padStart(3,"0")}.pdf"`);
    res.end(pdfBuffer);
  } catch (err) {
    logger.error({ err: err.message }, "pdf_error");
    res.status(500).json({ error: "No se pudo generar el PDF", detail: err.message });
  }
}); */

// ───────────────────────── Swagger (opcional) ──────────────
(() => {
  try {
    const swaggerJsDoc = require("swagger-jsdoc");
    const swaggerUi = require("swagger-ui-express");
    const swaggerConfig = require("./config/swagger");

    const swaggerDocs = swaggerJsDoc(swaggerConfig);
    const swaggerUiOpts = {
      swaggerOptions: { docExpansion: "none", tagsSorter: "alpha", operationsSorter: "alpha" },
    };

    const swaggerUser = process.env.SWAGGER_USER || "admin";
    const swaggerPass = process.env.SWAGGER_PASS || "admin123";

    if ((process.env.NODE_ENV || "").toLowerCase() === "production") {
      app.get("/api-doc.json", basicAuth(swaggerUser, swaggerPass), (_req, res) => res.json(swaggerDocs));
      app.use("/api-doc", basicAuth(swaggerUser, swaggerPass), swaggerUi.serve, swaggerUi.setup(swaggerDocs, swaggerUiOpts));
    } else {
      app.get("/api-doc.json", (_req, res) => res.json(swaggerDocs));
      app.use("/api-doc", swaggerUi.serve, swaggerUi.setup(swaggerDocs, swaggerUiOpts));
    }

    logger.info("[swagger] habilitado");
  } catch (e) {
    logger.warn(`[swagger] deshabilitado: ${e.message}`);
  }
})();

// ───────────────────────── Rutas públicas ──────────────────
app.use("/api/v1/auth", require("./routes/auth"));  // login moderno/legacy

// ───────────────────────── Rutas protegidas ────────────────
const requireAuth = (process.env.REQUIRE_AUTH || "").toLowerCase() === "true";
if (requireAuth) {
  app.use(authMiddleware);
  logger.info("🔒 Auth middleware ACTIVO");
} else {
  logger.warn("⚠️ Auth middleware DESACTIVADO (DEV)");
}

// API principal versionada
app.use("/api/v1", require("./routes"));

// ───────────────────────── 404 & errores ───────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Not Found" });
});

app.use(errorHandler);

// ───────────────────────── Arranque & shutdown ─────────────
let server;

async function startServer() {
  try {
    await pool.query("SELECT 1");
    logger.info("[DB] conexión OK");
  } catch (err) {
    logger.error({ err: err.message }, "[DB] ERROR de conexión. Abortando arranque.");
    process.exit(1);
  }

  server = app.listen(app.get("port"), "0.0.0.0", () => {
    logger.info({ port: app.get("port") }, "Server started");
  });
}

async function httpClose() {
  if (!server) return;
  return new Promise((resolve) => server.close(resolve));
}
async function stop(signal) {
  logger.info({ signal }, "Shutting down...");
  try {
    await httpClose();
    if (pool?.end) await pool.end();
    logger.info("Shutdown complete");
    process.exit(0);
  } catch (err) {
    logger.error({ err }, "Shutdown error");
    process.exit(1);
  }
}

process.on("SIGINT", () => stop("SIGINT"));
process.on("SIGTERM", () => stop("SIGTERM"));
process.once("SIGUSR2", async () => { await stop("SIGUSR2"); process.kill(process.pid, "SIGUSR2"); });

process.on("unhandledRejection", (reason) => { logger.error({ reason }, "UnhandledRejection"); });
process.on("uncaughtException", (err) => { logger.fatal({ err }, "UncaughtException"); process.exit(1); });

// Bootstrap
startServer();

module.exports = app;
