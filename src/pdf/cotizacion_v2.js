const PDFDocument = require("pdfkit");

const DEFAULT_MARGINS = { top: 70, bottom: 70, left: 60, right: 60 };

function ensureArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value];
}

function bulletList(doc, lines = [], { lineGap = 2, bullet = "-" } = {}) {
  const items = ensureArray(lines);
  if (!items.length) return;
  const startX = doc.page.margins.left;
  items.forEach((line, index) => {
    doc.text(`${bullet} ${line}`, startX, doc.y, { lineGap });
    if (index !== items.length - 1) doc.moveDown(0.2);
  });
}

function sectionTitle(doc, text, size = 13) {
  doc.font("Times-Bold").fontSize(size).text(text);
  doc.moveDown(0.5);
}

function subSectionTitle(doc, text, size = 12) {
  doc.font("Times-Bold").fontSize(size).text(text);
  doc.moveDown(0.2);
}

function dottedAmountLine(doc, label, amountText) {
  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const y = doc.y;
  const labelFont = "Times-Roman";
  const amountFont = "Times-Roman";

  const dotsFontSize = 11;
  doc.font(labelFont).fontSize(dotsFontSize);
  doc.text(label, left, y, { lineBreak: false });

  if (!amountText) {
    doc.moveDown(0.8);
    return;
  }

  const labelWidth = doc.widthOfString(label);
  doc.font(amountFont).fontSize(dotsFontSize);
  const amountWidth = doc.widthOfString(amountText);

  const dotsWidth = (right - left) - (labelWidth + amountWidth + 8);
  if (dotsWidth > 0) {
    const dotCharWidth = doc.widthOfString(".");
    const dotCount = Math.floor(dotsWidth / dotCharWidth);
    doc.text(".".repeat(dotCount), left + labelWidth + 4, y, { lineBreak: false });
  }
  doc.text(amountText, right - amountWidth, y, { lineBreak: false });
  doc.moveDown(0.8);
}

function setupFooter(doc, footer = {}) {
  const line1 = footer.line1 || "Calle Piura Mz-B4 Lt 10 S. J. De Miraflores   Telf: 7481252 / 999 091 822 / 946 202 445";
  const line2 = footer.line2 || "edwindelacruz03@gmail.com   fotodelacruz@hotmail.com";

  function renderFooter() {
    if (doc._writingFooter) return;
    doc._writingFooter = true;

    const { left, right, bottom } = doc.page.margins;
    const width = doc.page.width - left - right;
    const y = doc.page.height - bottom + 12;

    doc.save();
    doc.strokeColor("#000").lineWidth(0.5);
    doc.moveTo(left, y).lineTo(left + width, y).stroke();

    doc.font("Times-Roman").fontSize(9).fillColor("#000");
    doc.text(line1, left, y + 8, { width, align: "center" });
    doc.text(line2, left, y + 20, { width, align: "center" });
    doc.restore();

    doc._writingFooter = false;
  }

  renderFooter();
  doc.on("pageAdded", renderFooter);
}

function normalizeAmount({ currency = "USD", amount }) {
  if (amount == null || Number.isNaN(Number(amount))) return null;
  const value = Number(amount).toFixed(2);
  const prefix = currency === "USD" ? "US $" : (currency ? `${currency} ` : "");
  return `${prefix}${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function generarCotizacionPdfV2({
  cabecera = {},
  fotografia = {},
  video = {},
  totales = [],
  despedida,
  fechaTexto,
  firmaNombre = "Edwin De La Cruz",
  footer = {},
} = {}) {
  const {
    cliente = "Cliente",
    atencion = "",
    evento = "",
    eventoDetalle = "",
  } = cabecera;

  const recursosFoto = ensureArray(fotografia.recursos);
  const locacionesFoto = ensureArray(fotografia.locaciones);
  const productoFoto = ensureArray(fotografia.productoFinal);

  const equiposVideo = ensureArray(video.equiposFilmacion || video.equipos);
  const personalVideo = ensureArray(video.personal);
  const locacionesVideo = ensureArray(video.locaciones);
  const productoVideo = ensureArray(video.productoFinal);

  const totalesData = ensureArray(totales);
  const despedidaTexto = despedida || "Sin otro en particular nos despedimos agradeciendo de antemano por la confianza recibida.";
  const fechaRender = fechaTexto || new Date().toLocaleDateString("es-PE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margins: DEFAULT_MARGINS });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    setupFooter(doc, footer);

    doc.font("Times-Bold").fontSize(16).text("Cotización para tomas fotográficas y video", {
      align: "center",
    });
    doc.moveDown(1.5);

    if (cliente) {
      doc.font("Times-Bold").fontSize(12).text("Sres.: ", { continued: true });
      doc.font("Times-Roman").fontSize(12).text(cliente);
    }
    if (atencion) {
      doc.font("Times-Bold").fontSize(12).text("Atención: ", { continued: true });
      doc.font("Times-Roman").fontSize(12).text(atencion);
    }
    doc.moveDown(0.6);

    doc.font("Times-Roman").fontSize(12)
      .text("Por medio de la presente hago llegar la cotización para realización de fotografía y video.");

    if (evento) {
      doc.moveDown(0.3);
      doc.font("Times-Bold").fontSize(12).text("Evento: ", { continued: true });
      doc.font("Times-Roman").fontSize(12).text(eventoDetalle ? `${evento} – ${eventoDetalle}` : evento);
    }

    doc.moveDown(0.6);
    doc.font("Times-Roman").fontSize(12)
      .text("Las características y detalles a realizar se detallan a continuación:");
    doc.moveDown(0.8);

    sectionTitle(doc, "1) Fotografía");
    if (recursosFoto.length) {
      bulletList(doc, recursosFoto);
      doc.moveDown(0.6);
    }

    if (locacionesFoto.length) {
      subSectionTitle(doc, "a). - Locaciones a fotografiar");
      bulletList(doc, locacionesFoto);
      doc.moveDown(0.6);
    }

    if (productoFoto.length) {
      subSectionTitle(doc, "b). - Producto Final");
      bulletList(doc, productoFoto);
      doc.moveDown(0.8);
    }

    sectionTitle(doc, "2) Video");

    if (equiposVideo.length) {
      subSectionTitle(doc, "a.- Equipos de filmación:");
      bulletList(doc, equiposVideo);
      doc.moveDown(0.5);
    }

    if (personalVideo.length) {
      subSectionTitle(doc, "b.- Personal:");
      bulletList(doc, personalVideo);
      doc.moveDown(0.5);
    }

    if (locacionesVideo.length) {
      subSectionTitle(doc, "c.- Locaciones que se grabará en el evento");
      bulletList(doc, locacionesVideo);
      doc.moveDown(0.5);
    }

    if (productoVideo.length) {
      subSectionTitle(doc, "d.- Producto Final:");
      bulletList(doc, productoVideo);
      doc.moveDown(0.8);
    }

    if (totalesData.length) {
      doc.font("Times-Roman").fontSize(11);
      totalesData.forEach((item) => {
        if (item == null) return;
        if (typeof item === "string") {
          doc.text(item);
          doc.moveDown(0.5);
          return;
        }
        const label = item.label || "";
        const amountText = normalizeAmount(item);
        dottedAmountLine(doc, label, amountText);
      });
      doc.moveDown(0.6);
    }

    doc.font("Times-Roman").fontSize(12).text(despedidaTexto);
    doc.moveDown(1.2);

    doc.font("Times-Roman").fontSize(12).text(fechaRender, {
      align: "center",
    });
    doc.moveDown(1.2);

    doc.font("Times-Bold").fontSize(12).text(firmaNombre, {
      align: "center",
    });

    doc.end();
  });
}

module.exports = { generarCotizacionPdfV2 };
