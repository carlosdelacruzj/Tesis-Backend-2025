const express = require('express');
const router = express.Router();
const path = require('path');
const PdfPrinter = require('pdfmake');
const dayjs = require('dayjs');

// Fuentes estándar, no requieren archivos en disco
const fonts = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique',
  },
};

function soles(n) {
  const v = Number(n || 0);
  return v.toLocaleString('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 });
}

function buildDoc(payload) {
  const {
    company = {},
    quoteNumber,
    createdAt,

    pedido = {},
    cliente = {},
    evento = {},
    items = [],

    destinatario,
    atencion,
    eventoTitulo,
    seccionFoto,
    seccionVideo,
    totalesUSD,
    notaIGV = "Precios expresados en dólares no incluye el IGV (18%)",
    despedida = "Sin otro en particular nos despedimos agradeciendo de antemano por la confianza recibida.",
    fechaDoc,
    firmaNombre = "Edwin De La Cruz",
    firmaBase64
  } = payload;

  const _destinatario = destinatario
    ?? (cliente?.empresa || `${cliente?.nombres ?? ''} ${cliente?.apellidos ?? ''}`.trim() || '—');

  const _atencion = atencion
    ?? (cliente?.nombres || cliente?.apellidos
        ? `${cliente?.nombres ?? ''} ${cliente?.apellidos ?? ''}`.trim()
        : '—');

  const _eventoTitulo = eventoTitulo
    ?? `Evento: ${pedido?.nombre || '—'}${evento?.fecha ? ` – ${evento?.fecha}` : ''}`;

  const fotoDefaults = {
    equipos: [
      "2 cámaras fotográficas de 33 mega pixeles",
      "Lente profesional: 24–105 mm • 1 flash TTL"
    ],
    personal: ["2 fotógrafos"],
    locaciones: [
      `Tomas fotográficas según el evento`,
      (evento?.direccionExacta || evento?.direccion ? `Lugar: ${evento?.direccionExacta || evento?.direccion}` : null),
      "Horario referencial: 8:00 a.m. a 6:30 p.m."
    ].filter(Boolean),
    productoFinal: ["Carpeta online con fotos para su descarga – formato JPG de Alta Calidad"]
  };

  const videoDefaults = {
    equipos: [
      "2 cámaras profesionales sistema 4K",
      "Trípode Manfrotto, luz LED, lentes de alta definición"
    ],
    personal: ["2 videógrafos, 1 asistente"],
    locaciones: ["Cobertura de las locaciones señaladas para el evento"],
    productoFinal: [
      "Carpeta online con video para su descarga – formato Full HD 1920 × 1080",
      "Video resumen de 2 min, aprox",
      "La edición NO incluye animación 2D y 3D"
    ]
  };

  const F = seccionFoto || fotoDefaults;
  const V = seccionVideo || videoDefaults;

  const usd = (n) => Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const bullets = (arr) => (arr && arr.length)
    ? arr.map(t => ({ text: `-  ${t}` }))
    : [{ text: "-  —" }];

  // Totales (si no mandas, quedan en 0)
  const totalFoto = Number(totalesUSD?.foto || 0);
  const totalVideo = Number(totalesUSD?.video || 0);

  // Sección con espaciado mayor y subrayado en título
  const seccion = (numero, def, label) => ([
    { text: `${numero}) ${label}`, bold: true, decoration: 'underline', margin: [0, 20, 0, 8] },
    { text: "a).- Equipos de filmación / Fotografía:", italics: true, margin: [0, 0, 0, 2] },
    ...bullets(def.equipos),
    { text: "b).- Personal:", italics: true, margin: [0, 8, 0, 2] },
    ...bullets(def.personal),
    { text: "c).- Locaciones:", italics: true, margin: [0, 8, 0, 2] },
    ...bullets(def.locaciones),
    { text: "d).- Producto final:", italics: true, margin: [0, 8, 0, 2] },
    ...bullets(def.productoFinal),
  ]);

  const firmaStack = [];
  if (fechaDoc) firmaStack.push({ text: fechaDoc, margin: [0, 16, 0, 24] });
  if (firmaBase64) firmaStack.push({ image: firmaBase64, width: 120, margin: [0, 0, 0, 6] });
  firmaStack.push({ text: firmaNombre, margin: [0, 6, 0, 0] });

  return {
  pageSize: 'A4',
  // 👇 márgenes más reducidos arriba y abajo
  pageMargins: [50, 40, 50, 50],
  defaultStyle: { font: 'Helvetica', fontSize: 10 }, // 👈 fuente más pequeña

  content: [
    // === LOGO PEGADO ARRIBA ===
    company.logoBase64
      ? { image: company.logoBase64, width: 150, margin: [0, -20, 0, 10] } // 👈 más grande y subido
      : {},

    // === TÍTULO ===
    { text: "Cotización para tomas fotográficas y video", alignment: 'center', bold: true, margin: [0, 0, 0, 16] },

    // === Sres / Atención ===
    { text: `Sres.:  ${_destinatario}`, margin: [0, 0, 0, 2] },
    { text: `Atención:  ${_atencion}`, margin: [0, 0, 0, 10] },

    // === Intro + Evento ===
    { text: "Por medio de la presente hago llegar la cotización para realización de fotografía y video", margin: [0, 0, 0, 4] },
    { text: _eventoTitulo, bold: true, margin: [0, 0, 0, 8] },
    { text: "Las características y detalles que se realizarán se detallan a continuación:", margin: [0, 0, 0, 8] },

    // === 1) Fotografía ===
    ...seccion("1", F, "Fotografía"),

    // === 2) Video ===
    ...seccion("2", V, "Video"),

    // === Totales ===
    {
      margin: [0, 16, 0, 0],
      table: {
        widths: ['*', 'auto'],
        body: [
          [
            { text: 'Total, por el servicio fotografía ...............................................................', alignment: 'right', bold: true },
            { text: usd(totalFoto), alignment: 'right', bold: true }
          ],
          [
            { text: 'Total, por el servicio video .....................................................................', alignment: 'right', bold: true },
            { text: usd(totalVideo), alignment: 'right', bold: true }
          ],
        ]
      },
      layout: 'noBorders'
    },

    // === Nota IGV ===
    { text: notaIGV, margin: [0, 6, 0, 14] },

    // === Despedida ===
    { text: despedida, margin: [0, 0, 0, 14] },

    // === Fecha + Firma ===
    { stack: firmaStack, alignment: 'left' }
  ],

  footer: (currentPage, pageCount) => ({
    margin: [50, 10, 50, 0],
    columns: [
      { text: company.footerText || 'Telf: 7481252 / 999 091 822 / 946 202 445    •    edwindelacruz03@gmail.com', opacity: 0.8, fontSize: 9 },
      { text: `${currentPage} / ${pageCount}`, alignment: 'right', opacity: 0.6, fontSize: 9 }
    ]
  })
};

}


router.post('/cotizaciones', (req, res) => {
  try {
    const payload = req.body;
    const printer = new PdfPrinter(fonts);
    const doc = buildDoc(payload);
    const pdf = printer.createPdfKitDocument(doc);

    const filename = `cotizacion_${payload?.quoteNumber || Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    pdf.pipe(res);
    pdf.end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'No se pudo generar la cotización' });
  }
});

module.exports = router;
