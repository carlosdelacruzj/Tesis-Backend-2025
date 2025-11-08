// src/pdf/cotizacion.js
const PDFDocument = require("pdfkit");

/** ================= helpers ================= */
function fmtMoney(n, currency = "USD") {
  const v = Number(n || 0);
  const [int, dec] = v.toFixed(2).split(".");
  return `${currency === "USD" ? "US $" : ""}${int.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${dec}`;
}
function ensureArray(a) { return Array.isArray(a) ? a : (a ? [a] : []); }
function asRawBase64(s) {
  if (!s) return "";
  const m = String(s).match(/^data:.*;base64,(.*)$/i);
  return m ? m[1] : String(s);
}
function toCamelCaseName(value) {
  if (!value) return "";
  const parts = String(value)
    .trim()
    .split(/[^A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ]+/)
    .filter(Boolean);
  if (!parts.length) return "";
  return parts
    .map((part) => {
      const lower = part.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join("");
}
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}(:\d{2})?$/;
function formatDateHuman(value) {
  if (!value) return "";
  const str = String(value);
  if (ISO_DATE_RE.test(str)) {
    const [y, m, d] = str.split("-");
    return `${d}/${m}/${y}`;
  }
  const date = new Date(str);
  return Number.isNaN(date.getTime()) ? str : date.toLocaleDateString("es-PE");
}
function formatTimeHuman(value) {
  if (!value) return "";
  const str = String(value);
  if (TIME_RE.test(str)) return str.slice(0, 5);
  return str;
}

/** === Tamaños (ajusta SIZE_OPTION_TEXT a 11 si quieres -1pt) === */
const SIZE_OPTION = 13;       // "Opción X."
const SIZE_OPTION_TEXT = 10;  // todo lo que va debajo de la opción

/** ========== línea de costo (con puntos guía) ========== */
function costLine(
  doc, label, amount, currency = "USD",
  bold = true, withLeader = true, fontSize = SIZE_OPTION_TEXT
) {
  const left  = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const y = doc.y;

  const labelFont = bold ? "Helvetica-Bold" : "Helvetica";
  const txt = fmtMoney(amount, currency);

  doc.x = left;
  doc.font(labelFont).fontSize(fontSize);

  const labelW  = doc.widthOfString(label);
  const amountW = doc.widthOfString(txt);

  // Etiqueta
  doc.text(label, left, y, { lineBreak: false });

  // Puntos guía
  if (withLeader) {
    const dotW = doc.widthOfString(".");
    const avail = (right - left) - (labelW + amountW + 8);
    if (avail > 0) {
      const dots = ".".repeat(Math.floor(avail / dotW));
      doc.text(dots, left + labelW + 4, y, { lineBreak: false });
    }
  }

  // Monto a la derecha
  doc.text(txt, right - amountW, y, { lineBreak: false });

  // Restaurar flujo
  doc.x = left;
  doc.moveDown(0.8);
}

/** =========== render bloques =========== */
function renderOption(doc, idx, opt) {
  const left = doc.page.margins.left;
  doc.x = left;

  // Espacio entre opciones
  doc.moveDown(idx > 1 ? 1.0 : 0.6);

  // Título "Opción X." (13pt)
  doc.font("Helvetica-Bold").fontSize(SIZE_OPTION).text(`Opción ${idx}.`);

  // Texto debajo (10pt)
  doc.font("Helvetica").fontSize(SIZE_OPTION_TEXT);

  if (opt.titulo) { doc.x = left; doc.text(`— ${opt.titulo}`); doc.moveDown(0.4); }

  // Detalles con ligeros espacios
  const bullets = [];
  const dets = ensureArray(opt.bullets).filter(Boolean);
  dets.forEach(d => bullets.push(d));
  if (opt.personal != null) bullets.push(`Durante el evento estará/n presente/s ${opt.personal} fotógrafo/s`);
  if (opt.horas != null)    bullets.push(`Tiempo de trabajo: ${opt.horas} horas`);

  bullets.forEach((b, i) => {
    doc.x = left;
    doc.text(`-  ${b}`);
    if (i !== bullets.length - 1) doc.moveDown(0.2);
  });

  if (opt.notas) { doc.moveDown(0.4); doc.x = left; doc.text(`* Notas: ${opt.notas}`); }

  // Costo por el servicio (10pt)
  const total = Number(opt.precioUnitario || 0) * Number(opt.cantidad || 1);
  doc.moveDown(0.4);
  costLine(doc, "Costo por el servicio", total, opt.moneda || "USD", true, true, SIZE_OPTION_TEXT);
}

function renderCategory(doc, tituloNum, tituloSubrayado, opciones) {
  const left = doc.page.margins.left;
  doc.x = left;

  // Título subrayado (sin raya adicional)
  doc.font("Helvetica-Bold").fontSize(12).text(tituloNum, { continued: true });
  doc.text(tituloSubrayado, { underline: true });

  // Más espacio entre título y contenido
  doc.moveDown(0.8);

  if (!opciones || !opciones.length) {
    doc.x = left;
    doc.font("Helvetica-Oblique").fontSize(11).text("— sin opciones —").moveDown(1.0);
    return;
  }

  let idx = 1;
  opciones.forEach(opt => renderOption(doc, idx++, opt));

  // Aire extra al cerrar el tema
  doc.moveDown(1.0);
}

function renderExtras(doc, titulo, extras = []) {
  if (!extras || !extras.length) return;
  const left = doc.page.margins.left;

  doc.x = left;
  doc.font("Helvetica-Bold").fontSize(12).text(titulo, { underline: true });
  doc.moveDown(0.8); // espacio (sin línea horizontal)

  // Texto de extras en 10pt también
  doc.font("Helvetica").fontSize(SIZE_OPTION_TEXT);

  extras.forEach((e, i) => {
    doc.x = left;
    doc.text(`-  ${e.titulo || `Extra ${i+1}`}`);
    const total = Number(e.precioUnitario || 0) * Number(e.cantidad || 1);
    doc.moveDown(0.2);
    costLine(doc, "Costo", total, e.moneda || "USD", false, true, SIZE_OPTION_TEXT);
  });

  doc.moveDown(1.0);
}

// Firma a la derecha + fecha a la izquierda
function renderSignAndDate(doc, { createdAt, firmaBase64 }) {
  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;

  doc.moveDown(1.2);
  const yBase = doc.y;

  const fechaTxt = createdAt ? new Date(createdAt).toLocaleDateString()
                             : new Date().toLocaleDateString();
  doc.x = left;
  doc.font("Helvetica").fontSize(10).text(fechaTxt, left, yBase);

  const firmaWidth = 120;
  if (firmaBase64) {
    try {
      doc.image(Buffer.from(asRawBase64(firmaBase64), "base64"), right - firmaWidth, yBase - 20, { width: firmaWidth });
      doc.font("Helvetica").fontSize(10).text("Edwin De La Cruz", right - firmaWidth + 15, yBase + 40);
      doc.text("fotógrafo", right - firmaWidth + 15, yBase + 54);
    } catch {
      doc.font("Helvetica").fontSize(10).text("Edwin De La Cruz", right - 120, yBase);
      doc.text("fotógrafo", right - 120, yBase + 14);
    }
  } else {
    doc.font("Helvetica").fontSize(10).text("Edwin De La Cruz", right - 120, yBase);
    doc.text("fotógrafo", right - 120, yBase + 14);
  }
  doc.x = left;
  doc.moveDown(1.2);
}

/** ========== Footer SEGURO ========== */
function setupFooter(doc) {
  function footer() {
    if (doc._writingFooter) return;
    doc._writingFooter = true;

    const ml = doc.page.margins.left;
    const usableWidth = doc.page.width - ml - doc.page.margins.right;
    const y = doc.page.height - doc.page.margins.bottom - 28;

    const prevX = doc.x, prevY = doc.y;

    doc.save();
    doc.font("Helvetica").fontSize(9);
    doc.text("Telf: 999 091 822 / 946 202 445", ml, y,     { width: usableWidth, align: "center", lineBreak: false });
    doc.text("edwindelacruz03@gmail.com",       ml, y + 12, { width: usableWidth, align: "center", lineBreak: false });
    doc.restore();

    doc.x = prevX; doc.y = prevY;
    doc._writingFooter = false;
  }
  footer();
  doc.on("pageAdded", footer);
}

function renderLocations(doc, locaciones = []) {
  const data = ensureArray(locaciones).filter(Boolean);
  if (!data.length) return;

  const left = doc.page.margins.left;
  doc.x = left;
  doc.font("Helvetica-Bold").fontSize(12).text("3.-  ", { continued: true });
  doc.text("Locaciones", { underline: true });
  doc.moveDown(0.8);

  doc.font("Helvetica").fontSize(SIZE_OPTION_TEXT);
  data.forEach((loc, idx) => {
    const fecha = formatDateHuman(loc.fecha);
    const hora = formatTimeHuman(loc.hora);
    const fechaHora = [fecha, hora].filter(Boolean).join(" • ");
    const ubicacionRaw = loc.ubicacion || loc.lugar || "";
    const ubicacion = toCamelCaseName(ubicacionRaw);
    const direccion = loc.direccion || "";

    doc.x = left;
    const heading = ubicacion ? `${ubicacion}` : `Locación ${idx + 1}`;
    doc.font("Helvetica-Bold").fontSize(SIZE_OPTION).text(heading);
    doc.moveDown(0.2);

    doc.font("Helvetica").fontSize(SIZE_OPTION_TEXT);
    if (fechaHora) {
      doc.x = left;
      doc.text(`-  ${fechaHora}`);
    }
    if (ubicacion) {
      doc.x = left;
      doc.text(`-  Ubicación: ${ubicacion}`);
    }
    if (direccion) {
      doc.x = left;
      doc.text(`-  Dirección: ${direccion}`);
    }
    if (loc.notas) {
      doc.x = left;
      doc.font("Helvetica-Oblique").text(`* Notas: ${loc.notas}`);
      doc.font("Helvetica").fontSize(SIZE_OPTION_TEXT);
    }

    if (idx !== data.length - 1) doc.moveDown(0.6);
  });

  doc.moveDown(0.8);
}

/** ================== API principal ================== */
function generarCotizacionPdf({ cabecera = {}, selecciones = {}, locaciones = [] }) {
  const {
    atencion, evento, fechaEvento, lugar,
    logoBase64, firmaBase64, videoEquipo, createdAt
  } = cabecera;
  const { foto = [], video = [], extrasFoto = [], extrasVideo = [] } = selecciones;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks = [];
    doc.on("data", c => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    setupFooter(doc);

    // Logo
    if (logoBase64) {
      try { doc.image(Buffer.from(asRawBase64(logoBase64), "base64"), doc.page.margins.left, 20, { width: 120 }); }
      catch {}
    } else {
      doc.font("Helvetica-Bold").fontSize(16).text("D’ La Cruz Video y Fotografía", { align: "left" });
    }

    // Título
    doc.moveDown(1.0);
    doc.font("Helvetica-Bold").fontSize(18)
      .text("Cotización para tomas fotográficas y video", { align: "center" })
      .moveDown(1.0);
    doc.x = doc.page.margins.left;

    // Atención + mensaje
    doc.font("Helvetica").fontSize(11);
    if (atencion) {
      doc.text("Atención: ", { continued: true });
      doc.font("Helvetica-Bold").text(atencion);
      doc.font("Helvetica");
    }
    const fechaTxt = fechaEvento ? new Date(fechaEvento).toLocaleDateString() : "—";
    const msg = `Por medio de la presente hago llegar la cotización para la realización de fotografía y video para ${evento || "evento"} a realizarse el ${fechaTxt}${lugar ? `, ${lugar}` : ""}.`;
    doc.moveDown(0.4).text(msg).moveDown(1.0);
    doc.x = doc.page.margins.left;

    // 1) Fotografía
    renderCategory(doc, "1.-  ", "Fotografía", foto);
    renderExtras(doc, "Eventos Adicionales (Fotografía)", extrasFoto);

    // 2) Video
    const videoTitleRight = videoEquipo ? `Servicio de filmación — ${videoEquipo}` : "Servicio de filmación";
    renderCategory(doc, "2.-  ", videoTitleRight, video);
    renderExtras(doc, "Eventos Adicionales (Video)", extrasVideo);

    // Locaciones calendarizadas
    renderLocations(doc, locaciones);

    // Firma + Fecha
    renderSignAndDate(doc, { createdAt, firmaBase64 });

    doc.end();
  });
}

module.exports = { generarCotizacionPdf };
