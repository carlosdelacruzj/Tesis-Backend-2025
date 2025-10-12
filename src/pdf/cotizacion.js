// src/pdf/cotizacion.js
const PDFDocument = require("pdfkit");

// helpers
function sectionRule(doc, yPad = 6) {
  const x0 = 50, x1 = doc.page.width - 50, y = doc.y + yPad;
  doc.moveTo(x0, y).lineTo(x1, y).lineWidth(0.5).strokeColor("#333").stroke().moveDown(0.3);
}
function ensureArray(a) { return Array.isArray(a) ? a : (a ? [a] : []); }

// equipo (global opcional)
function renderEquipoGlobal(doc, equipo = []) {
  if (!Array.isArray(equipo) || equipo.length === 0) return;
  doc.moveDown(0.5);
  doc.font("Helvetica-Bold").fontSize(12).text("Equipo asignado (general)").moveDown(0.3);
  sectionRule(doc, 4);
  doc.font("Helvetica").fontSize(11);
  equipo.forEach((e) => {
    const nombre = e.nombre || e.empleado || e.fullname || "—";
    const rol    = e.rol || e.puesto || e.cargo || "";
    const tel    = e.celular || e.telefono || "";
    doc.text(`- ${nombre}${rol ? " — " + rol : ""}${tel ? " — " + tel : ""}`);
  });
  doc.moveDown(0.8);
}
function pickStaffLines(equipo = [], count = 0) {
  if (!Array.isArray(equipo) || equipo.length === 0 || !count) return [];
  return equipo.slice(0, Math.max(0, count)).map(e => {
    const nombre = e.nombre || e.empleado || e.fullname || "—";
    const rol    = e.rol || e.puesto || e.cargo || "";
    return `${nombre}${rol ? " — " + rol : ""}`;
  });
}

// renderers
function renderOption(doc, idx, opt, equipo) {
  doc.font("Helvetica-Bold").fontSize(12).text(`Opción ${idx}.`);
  doc.font("Helvetica").fontSize(11);

  const bullets = [
    ...(ensureArray(opt.bullets)),
    opt.horas ? `Tiempo de trabajo: ${opt.horas} horas` : null,
  ].filter(Boolean);

  if (opt.titulo) doc.text(`— ${opt.titulo}`);
  bullets.forEach(b => doc.text(`-  ${b}`));

  // STAFF ESTÁTICO POR OPCIÓN (siempre que personal > 0)
  const nStaff = Number(opt.personal || 0);
  if (nStaff > 0) {
    const lines = pickStaffLines(equipo, nStaff);
    // siempre muestra el número; si hay nombres, también
    doc.text(`Personal asignado: ${nStaff}`);
    if (lines.length) lines.forEach(s => doc.text(`   • ${s}`));
  }

  if (opt.notas) doc.text(`* Notas: ${opt.notas}`, { oblique: true });
  doc.moveDown(0.8); // sin totales
}

function renderCategory(doc, titulo, opciones) {
  doc.font("Helvetica-Bold").fontSize(12).text(titulo).moveDown(0.4);
  sectionRule(doc, 4);

  if (!opciones || opciones.length === 0) {
    doc.font("Helvetica-Oblique").fontSize(11).text(`No se seleccionaron opciones de ${/foto/i.test(titulo) ? "fotografía" : "video"}.`).moveDown(0.8);
    return;
  }

  let idx = 1;
  opciones.forEach(opt => renderOption(doc, idx++, opt, renderCategory.__equipo));
  doc.moveDown(0.8);
}

// API
function generarCotizacionPdf({ cabecera = {}, selecciones = {}, equipo = [] }) {
  const { foto = [], video = [], extrasFoto = [], extrasVideo = [] } = selecciones;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks = [];
    doc.on("data", c => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // header
    doc.font("Helvetica-Bold").fontSize(18).text("Presupuesto fotografía y video", { align: "center" }).moveDown(1);
    doc.font("Helvetica").fontSize(11);
    if (cabecera.atencion) doc.text(`Atención:  ${cabecera.atencion}`);
    if (cabecera.mensajeIntro) doc.moveDown(0.5).text(cabecera.mensajeIntro);
    if (cabecera.lugarFecha) doc.moveDown(0.5).text(cabecera.lugarFecha);
    doc.moveDown(0.6);

    renderEquipoGlobal(doc, equipo);
    renderCategory.__equipo = equipo;

    // categorías (sin totales)
    renderCategory(doc, "1.-  Fotografía", foto);
    renderCategory(doc, "2.-  Servicio de filmación - 35 mm y sistema 4K", video);

    // extras (si quieres listarlos, sin importes)
    if (extrasFoto.length) {
      doc.font("Helvetica-Bold").fontSize(12).text("Eventos Adicionales (Fotografía)").moveDown(0.4);
      sectionRule(doc, 4);
      extrasFoto.forEach((e, i) => doc.font("Helvetica").fontSize(11).text(`-  ${e.titulo || `Extra ${i+1}`}`));
      doc.moveDown(0.8);
    }
    if (extrasVideo.length) {
      doc.font("Helvetica-Bold").fontSize(12).text("Eventos Adicionales (Video)").moveDown(0.4);
      sectionRule(doc, 4);
      extrasVideo.forEach((e, i) => doc.font("Helvetica").fontSize(11).text(`-  ${e.titulo || `Extra ${i+1}`}`));
      doc.moveDown(0.8);
    }

    // cierre
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

module.exports = { generarCotizacionPdf };
