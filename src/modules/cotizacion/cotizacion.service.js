// cotizacion.service.js
const PdfPrinter = require("pdfmake");
const logger = require("../../utils/logger");
const repo = require("./cotizacion.repository");

const ESTADOS_VALIDOS = new Set([
  "Borrador",
  "Enviada",
  "Aceptada",
  "Rechazada",
]);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const PDF_FONTS = {
  Helvetica: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
};

// ───────────── Utilidades de errores / validaciones ─────────────
function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}
function assertPositiveInt(v, f) {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw badRequest(`${f} inválido`);
  return n;
}
function assertNonNegativeInt(v, f) {
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0)
    throw badRequest(`${f} inválido (debe ser entero ≥ 0)`);
  return n;
}
function assertNumberNonNeg(v, f) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0)
    throw badRequest(`${f} inválido (debe ser número ≥ 0)`);
  return Number(n.toFixed(2));
}
function assertString(v, f) {
  if (typeof v !== "string" || !v.trim())
    throw badRequest(`Campo '${f}' es requerido`);
  return v.trim();
}
function cleanString(v) {
  if (v == null) return null;
  const t = String(v).trim();
  return t === "" ? null : t;
}
function assertDate(v, f) {
  if (v == null) return null;
  if (typeof v !== "string" || !ISO_DATE.test(v))
    throw badRequest(`Campo '${f}' debe ser YYYY-MM-DD`);
  return v;
}
function assertHoras(v) {
  if (v == null) return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0)
    throw badRequest("horasEstimadas debe ser numérico positivo");
  return Number(n.toFixed(1));
}
function assertEstado(v) {
  if (v == null) return "Borrador";
  const e = String(v).trim();
  if (!ESTADOS_VALIDOS.has(e))
    throw badRequest(
      `estado inválido. Valores permitidos: ${[...ESTADOS_VALIDOS].join(", ")}`
    );
  return e;
}
function assertCurrency3(v, f) {
  const s = String(v || "")
    .trim()
    .toUpperCase();
  if (!/^[A-Z]{3}$/.test(s))
    throw badRequest(
      `Campo '${f}' debe ser un código de moneda ISO de 3 letras`
    );
  return s;
}
function assertArray(v, f) {
  if (!Array.isArray(v)) throw badRequest(`Campo '${f}' debe ser un arreglo`);
  return v;
}

function formatCurrencyUSD(value) {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

// ───────────── Normalizaciones (UI → SP JSON en español) ─────────────
function normalizeItemsInput(itemsPayload, field = "items") {
  return assertArray(itemsPayload, field).map((it, idx) => {
    const base = `${field}[${idx}]`;
    const idEventoServicio = assertPositiveInt(
      it.idEventoServicio ?? it.exsId,
      `${base}.idEventoServicio`
    );
    const titulo = assertString(it.titulo ?? it.nombre, `${base}.titulo`);
    const descripcion = cleanString(it.descripcion);
    const moneda = assertCurrency3(it.moneda, `${base}.moneda`);
    const precioUnitario = assertNumberNonNeg(
      it.precioUnitario ?? it.precioUnit,
      `${base}.precioUnitario`
    );
    const cantidad = assertPositiveInt(it.cantidad ?? 1, `${base}.cantidad`);
    const notas = cleanString(it.notas);
    const horas =
      it.horas == null ? null : assertNonNegativeInt(it.horas, `${base}.horas`);
    const personal =
      it.personal == null
        ? null
        : assertNonNegativeInt(it.personal, `${base}.personal`);
    const fotosImpresas =
      it.fotosImpresas == null
        ? null
        : assertNonNegativeInt(it.fotosImpresas, `${base}.fotosImpresas`);
    const trailerMin =
      it.trailerMin == null
        ? null
        : assertNonNegativeInt(it.trailerMin, `${base}.trailerMin`);
    const filmMin =
      it.filmMin == null
        ? null
        : assertNonNegativeInt(it.filmMin, `${base}.filmMin`);

    // Mapeo al contrato del SP (español):
    return {
      idEventoServicio,
      nombre: titulo,
      descripcion,
      moneda,
      precioUnit: precioUnitario,
      cantidad,
      descuento: 0,
      recargo: 0,
      notas,
      horas,
      personal,
      fotosImpresas,
      trailerMin,
      filmMin,
    };
  });
}

function computeItemsAggregates(items = []) {
  // items aquí son los normalizados (precioUnit / cantidad, etc.)
  const totalCalculado = Number(
    items
      .reduce((acc, it) => acc + (it.precioUnit ?? 0) * (it.cantidad ?? 0), 0)
      .toFixed(2)
  );
  const horasTotales = items.reduce(
    (acc, it) => acc + (it.horas ?? 0) * (it.cantidad ?? 1),
    0
  );
  const personalTotal = items.reduce(
    (acc, it) => acc + (it.personal ?? 0) * (it.cantidad ?? 1),
    0
  );
  return { totalCalculado, horasTotales, personalTotal };
}

function bulletsBlock(values = []) {
  const list = Array.isArray(values) ? values.filter(Boolean) : [];
  if (!list.length) return [{ text: "-  --" }];
  return list.map((text) => ({ text: `-  ${text}` }));
}

function buildPdfDefinition(payload = {}) {
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
    notaIGV = "Precios expresados en dolares no incluye el IGV (18%)",
    despedida = "Sin otro en particular nos despedimos agradeciendo de antemano por la confianza recibida.",
    fechaDoc,
    firmaNombre = "Edwin De La Cruz",
    firmaBase64,
  } = payload;

  const resolvedDestinatario =
    destinatario ||
    cliente.empresa ||
    `${cliente.nombres ?? ""} ${cliente.apellidos ?? ""}`.trim() ||
    "--";
  const resolvedAtencion =
    atencion ||
    (cliente.nombres || cliente.apellidos
      ? `${cliente.nombres ?? ""} ${cliente.apellidos ?? ""}`.trim()
      : "--");
  const resolvedEventoTitulo =
    eventoTitulo ||
    `Evento: ${pedido.nombre || "--"}${
      evento.fecha ? ` - ${evento.fecha}` : ""
    }`;

  const fotoDefaults = {
    equipos: [
      "2 camaras fotograficas de 33 megapixeles",
      "Lente profesional 24-105 mm - 1 flash TTL",
    ],
    personal: ["2 fotografos"],
    locaciones: [
      "Tomas fotograficas segun el evento",
      evento.direccionExacta || evento.direccion
        ? `Lugar: ${evento.direccionExacta || evento.direccion}`
        : null,
      "Horario referencial: 8:00 a.m. a 6:30 p.m.",
    ].filter(Boolean),
    productoFinal: [
      "Carpeta online con fotos para su descarga - formato JPG de alta calidad",
    ],
  };

  const videoDefaults = {
    equipos: [
      "2 camaras profesionales sistema 4K",
      "Tripode Manfrotto, luz LED, lentes de alta definicion",
    ],
    personal: ["2 videografos, 1 asistente"],
    locaciones: ["Cobertura de las locaciones senaladas para el evento"],
    productoFinal: [
      "Carpeta online con video para su descarga - formato Full HD 1920x1080",
      "Video resumen de 2 minutos aprox",
      "La edicion no incluye animacion 2D ni 3D",
    ],
  };

  const fotoConfig = seccionFoto || fotoDefaults;
  const videoConfig = seccionVideo || videoDefaults;
  const totalFoto = Number(totalesUSD?.foto || 0);
  const totalVideo = Number(totalesUSD?.video || 0);

  const itemsTable =
    Array.isArray(items) && items.length
      ? {
          margin: [0, 16, 0, 0],
          table: {
            headerRows: 1,
            widths: ["*", "auto", "auto", "auto"],
            body: [
              [
                { text: "Descripción", bold: true },
                { text: "Cantidad", bold: true },
                { text: "Horas", bold: true },
                { text: "Precio", bold: true },
              ],
              ...items.map((it) => [
                `${it.titulo || "--"}${
                  it.descripcion ? `\n${it.descripcion}` : ""
                }`,
                it.cantidad ?? "--",
                it.horas ?? "--",
                formatCurrencyUSD(it.precioUnitario ?? 0),
              ]),
            ],
          },
          layout: "lightHorizontalLines",
        }
      : null;

  const debugItemsSection =
    Array.isArray(items) && items.length
      ? [
          {
            text: "Mapa de valores de items",
            bold: true,
            margin: [0, 20, 0, 6],
          },
          ...items.map((item, idx) => ({
            margin: [0, 6, 0, 0],
            stack: [
              { text: `Item ${idx + 1}`, bold: true },
              {
                table: {
                  widths: [200, "*"],
                  body: Object.entries(item).map(([key, value]) => [
                    { text: `items[${idx}].${key}` },
                    { text: value == null ? "null" : String(value) },
                  ]),
                },
                layout: "noBorders",
              },
            ],
          })),
        ]
      : [];

  const section = (index, config, label) => [
    {
      text: `${index}) ${label}`,
      bold: true,
      decoration: "underline",
      margin: [0, 18, 0, 8],
    },
    {
      text: "a) Equipos de filmacion / fotografia:",
      italics: true,
      margin: [0, 0, 0, 2],
    },
    ...bulletsBlock(config.equipos),
    { text: "b) Personal:", italics: true, margin: [0, 8, 0, 2] },
    ...bulletsBlock(config.personal),
    { text: "c) Locaciones:", italics: true, margin: [0, 8, 0, 2] },
    ...bulletsBlock(config.locaciones),
    { text: "d) Producto final:", italics: true, margin: [0, 8, 0, 2] },
    ...bulletsBlock(config.productoFinal),
  ];

  return {
    pageSize: "A4",
    pageMargins: [50, 40, 50, 50],
    defaultStyle: { font: "Helvetica", fontSize: 10 },
    content: [
      company.logoBase64
        ? { image: company.logoBase64, width: 150, margin: [0, -20, 0, 10] }
        : {},
      {
        text: "Cotizacion para tomas fotograficas y video",
        alignment: "center",
        bold: true,
        margin: [0, 0, 0, 16],
      },
      { text: `Sres.:  ${resolvedDestinatario}`, margin: [0, 0, 0, 2] },
      { text: `Atencion:  ${resolvedAtencion}`, margin: [0, 0, 0, 10] },
      {
        text: "Por medio de la presente hago llegar la cotizacion para realizacion de fotografia y video",
        margin: [0, 0, 0, 4],
      },
      { text: resolvedEventoTitulo, bold: true, margin: [0, 0, 0, 8] },
      {
        text: "Las caracteristicas y detalles que se realizaran se detallan a continuacion:",
        margin: [0, 0, 0, 8],
      },
      ...section("1", fotoConfig, "Fotografia"),
      ...section("2", videoConfig, "Video"),
      ...(itemsTable ? [itemsTable] : []),
      {
        margin: [0, 16, 0, 0],
        table: {
          widths: ["*", "auto"],
          body: [
            [
              {
                text: "Total servicio fotografia",
                alignment: "right",
                bold: true,
              },
              {
                text: formatCurrencyUSD(totalFoto),
                alignment: "right",
                bold: true,
              },
            ],
            [
              { text: "Total servicio video", alignment: "right", bold: true },
              {
                text: formatCurrencyUSD(totalVideo),
                alignment: "right",
                bold: true,
              },
            ],
          ],
        },
        layout: "noBorders",
      },
      { text: notaIGV, margin: [0, 6, 0, 14] },
      { text: despedida, margin: [0, 0, 0, 14] },
      {
        margin: [0, 60, 0, 0],
        columns: [
          fechaDoc ? { text: fechaDoc, alignment: "left" } : { text: "" },
          {
            stack: [
              firmaBase64
                ? { image: firmaBase64, width: 120, margin: [0, 0, 0, 4] }
                : null,
              { text: firmaNombre || "", alignment: "right" },
            ].filter(Boolean),
            alignment: "right",
          },
        ],
      },
      ...debugItemsSection,
    ],
    footer: (currentPage, pageCount) => ({
      margin: [50, 10, 50, 0],
      columns: [
        {
          text:
            company.footerText ||
            "Telf: 7481252 / 999 091 822 / 946 202 445    -    edwindelacruz03@gmail.com",
          opacity: 0.8,
          fontSize: 9,
        },
        {
          text: `${currentPage} / ${pageCount}`,
          alignment: "right",
          opacity: 0.6,
          fontSize: 9,
        },
      ],
    }),
    metadata: {
      title: `Cotizacion ${quoteNumber ?? ""}`.trim(),
      subject: "Cotizacion",
      author: company.nombre || "",
      creator: "Sistema Backoffice",
      producer: "pdfmake",
      creationDate: createdAt ? new Date(createdAt) : new Date(),
    },
  };
}

function createPdfDocument(payload = {}) {
  const printer = new PdfPrinter(PDF_FONTS);
  const definition = buildPdfDefinition(payload);
  return printer.createPdfKitDocument(definition);
}

function mapDetailToPdfPayload(detail, { includeItems = false } = {}) {
  const leadNombre = detail.leadNombre || detail.lead?.nombre || "";
  const leadApellidos = detail.lead?.apellidos || "";
  const destinatario = detail.destinatario || leadNombre;

  const items =
    includeItems && Array.isArray(detail.items)
      ? detail.items.map((item) => ({
          id: item.id ?? item.idCotizacionServicio ?? item.id_item ?? null,
          idEventoServicio:
            item.idEventoServicio ?? item.id_evento_servicio ?? null,
          titulo: item.titulo ?? item.nombre ?? null,
          descripcion: item.descripcion ?? null,
          moneda: item.moneda || null,
          precioUnitario: Number(
            item.precioUnitario ?? item.precioUnit ?? item.precio_unit ?? 0
          ),
          cantidad: Number(item.cantidad ?? item.qty ?? 0),
          notas: item.notas ?? "",
          horas: item.horas,
          personal: item.personal,
          fotosImpresas: item.fotosImpresas,
          trailerMin: item.trailerMin,
          filmMin: item.filmMin,
        }))
      : undefined;

  const totalEstimado = detail.totalEstimado ?? detail.totalCalculado ?? 0;

  return {
    company: {
      nombre: process.env.COMPANY_NAME || "Backoffice",
      logoBase64: process.env.COMPANY_LOGO_BASE64,
      footerText: process.env.COMPANY_FOOTER,
    },
    quoteNumber: detail.id,
    createdAt: detail.fechaCreacion,
    pedido: {
      nombre: detail.tipoEvento,
    },
    cliente: {
      nombres: leadNombre,
      apellidos: leadApellidos,
      empresa: detail.leadEmpresa || detail.leadOrigen || null,
    },
    evento: {
      fecha: detail.fechaEvento,
      direccion: detail.lugar,
      direccionExacta: detail.lugar,
    },
    items,
    destinatario,
    atencion: leadNombre,
    eventoTitulo: `Evento: ${detail.tipoEvento || "--"}${
      detail.fechaEvento ? ` - ${detail.fechaEvento}` : ""
    }`,
    totalesUSD: {
      foto: totalEstimado,
      video: 0,
    },
    notaIGV: process.env.PDF_NOTA_IGV || undefined,
    despedida: process.env.PDF_DESPEDIDA || undefined,
    fechaDoc: process.env.PDF_FECHA_DOC || undefined,
    firmaNombre: process.env.PDF_FIRMA_NOMBRE || undefined,
    firmaBase64: process.env.PDF_FIRMA_BASE64 || undefined,
  };
}

async function streamPdf({ id, res } = {}) {
  const cotizacionId = assertPositiveInt(id, "id");

  const isProd = (process.env.NODE_ENV || "").toLowerCase() === "production";
  logger.info(
    {
      module: "cotizacion",
      action: "streamPdf:start",
      id: cotizacionId,
      env: isProd ? "production" : "non-production",
    },
    "Iniciando generación de PDF"
  );

  const detail = await repo.findByIdWithItems(cotizacionId);
  if (!detail) {
    const err = new Error(`Cotización ${cotizacionId} no encontrada`);
    err.status = 404;
    logger.warn(
      {
        module: "cotizacion",
        action: "streamPdf:notFound",
        id: cotizacionId,
      },
      "Cotización no encontrada para PDF"
    );
    throw err;
  }

  logger.info(
    {
      module: "cotizacion",
      action: "streamPdf:detailLoaded",
      id: cotizacionId,
      estado: detail.estado,
      leadNombre: detail.leadNombre,
      items: Array.isArray(detail.items) ? detail.items.length : 0,
    },
    "Detalle de cotización cargado"
  );

  const payload = mapDetailToPdfPayload(detail, { includeItems: true });
  if (typeof logger.debug === "function") {
    logger.debug(
      {
        module: "cotizacion",
        action: "streamPdf:payload",
        id: cotizacionId,
        hasItems: Array.isArray(payload.items),
        itemsPreview: Array.isArray(payload.items)
          ? payload.items.slice(0, 3).map((item) => ({
              id: item.id,
              idEventoServicio: item.idEventoServicio,
              titulo: item.titulo,
              descripcion: item.descripcion,
              precioUnitario: item.precioUnitario,
              cantidad: item.cantidad,
              notas: item.notas,
              horas: item.horas,
              personal: item.personal,
              fotosImpresas: item.fotosImpresas,
              trailerMin: item.trailerMin,
              filmMin: item.filmMin,
            }))
          : undefined,
        includeItems: true,
      },
      "Payload preparado para PDF"
    );
  }
  const doc = createPdfDocument(payload);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="cotizacion_${cotizacionId}.pdf"`
  );

  doc.pipe(res);
  doc.end();

  logger.info(
    {
      module: "cotizacion",
      action: "streamPdf:completed",
      id: cotizacionId,
    },
    "PDF enviado al cliente"
  );
}

// ───────────── Mapeos de salida ─────────────
function mapRowList(r) {
  // IDs y campos base (tolera SP y SQL directo)
  const id = r.id ?? r.idCotizacion ?? r.cotizacion_id ?? r.PK_Cot_Cod;
  const estado = r.estado ?? r.Cot_Estado;
  const fechaCreacion = r.fechaCreacion ?? r.Cot_Fecha_Crea;

  const eventoId = r.eventoId ?? r.Cot_IdTipoEvento ?? null;
  const tipoEvento = r.tipoEvento ?? r.Cot_TipoEvento;
  const fechaEvento = r.fechaEvento ?? r.Cot_FechaEvento;
  const lugar = r.lugar ?? r.Cot_Lugar;
  const horasEstimadas = r.horasEstimadas ?? r.Cot_HorasEst;
  const mensaje = r.mensaje ?? r.Cot_Mensaje;
  const total = r.total ?? r.cot_total ?? null;

  // Campos de lead provenientes del SP: idLead, nombre, celular, etc.
  const lead = {
    id: r.leadId ?? r.idLead ?? r.PK_Lead_Cod,
    nombre: r.leadNombre ?? r.nombre ?? r.Lead_Nombre,
    celular: r.leadCelular ?? r.celular ?? r.Lead_Celular,
    origen: r.leadOrigen ?? r.origen ?? r.Lead_Origen,
    fechaCreacion: r.leadFechaCreacion ?? r.Lead_Fecha_Crea,
  };

  return {
    id,
    estado,
    fechaCreacion,
    eventoId,
    tipoEvento,
    fechaEvento,
    lugar,
    horasEstimadas,
    mensaje,
    total,
    lead,
  };
}

// ───────────── Casos de uso (API) ─────────────
async function list({ estado } = {}) {
  const filtroEstado = estado ? assertEstado(estado) : undefined;
  const rows = await repo.listAll({ estado: filtroEstado });
  return rows.map(mapRowList);
}
// ── mapea JSON del SP → contrato de API ──
// function mapDetailFromJson(obj) {
//   const it = (x) => ({
//     id: x.itemId ?? x.idCotizacionServicio ?? null,
//     idEventoServicio: x.exsId ?? x.idEventoServicio ?? null,
//     titulo: x.nombre,
//     descripcion: x.descripcion,
//     moneda: x.moneda,
//     precioUnitario: x.precioUnit,
//     cantidad: x.cantidad,
//     notas: x.notas,
//     horas: x.horas,
//     personal: x.personal,
//     fotosImpresas: x.fotosImpresas,
//     trailerMin: x.trailerMin,
//     filmMin: x.filmMin,
//     subtotal: x.subtotal,
//   });

//   return {
//     id: obj.idCotizacion,
//     lead: {
//       id: obj.lead?.idlead,
//       nombre: obj.lead?.nombre,
//       celular: obj.lead?.celular,
//       origen: obj.lead?.origen,
//       fechaCreacion: obj.lead?.fechaCrea,
//     },
//     cotizacion: {
//       eventoId: obj.cotizacion?.idTipoEvento ?? null,
//       tipoEvento: obj.cotizacion?.tipoEvento,
//       fechaEvento: obj.cotizacion?.fechaEvento,
//       lugar: obj.cotizacion?.lugar,
//       horasEstimadas: obj.cotizacion?.horasEstimadas,
//       mensaje: obj.cotizacion?.mensaje,
//       estado: obj.cotizacion?.estado,
//       total: obj.cotizacion?.total ?? null,
//       fechaCreacion: obj.cotizacion?.fechaCreacion,
//     },
//     items: Array.isArray(obj.items) ? obj.items.map(it) : [],
//   };
// }

// ── usa repo.findByIdWithItems (SP JSON) y mapea al contrato de API ──
async function findById(id) {
  const n = assertPositiveInt(id, "id");
  const data = await repo.findByIdWithItems(n); // <- SP JSON
  if (!data) {
    const err = new Error(`Cotización ${n} no encontrada`);
    err.status = 404;
    throw err;
  }
  // return mapDetailFromJson(data);
  return data;
}

// Crea por público (prospecto)
async function createPublic(payload = {}) {
  const lead = payload.lead || {};
  const cot = payload.cotizacion || {};

  const nombre = assertString(lead.nombre, "lead.nombre");
  const celular = cleanString(lead.celular);
  const origen = cleanString(lead.origen) ?? "Web";

  const tipoEvento = assertString(cot.tipoEvento, "cotizacion.tipoEvento");
  const idTipoEvento =
    cot.idTipoEvento != null
      ? assertPositiveInt(cot.idTipoEvento, "cotizacion.idTipoEvento")
      : null;
  const fechaEvento = assertDate(cot.fechaEvento, "cotizacion.fechaEvento");
  const lugar = cleanString(cot.lugar);
  const horasEstimadas = assertHoras(cot.horasEstimadas);
  const mensaje = cleanString(cot.mensaje);

  const result = await repo.createPublic({
    lead: { nombre, celular, origen },
    cotizacion: {
      tipoEvento,
      idTipoEvento,
      fechaEvento,
      lugar,
      horasEstimadas,
      mensaje,
    },
  });

  return { Status: "Registro exitoso", ...result };
}

// Crea por admin (completa, con items)
async function createAdmin(payload = {}) {
  const lead = payload.lead || {};
  const cot = payload.cotizacion || {};
  const items = normalizeItemsInput(payload.items ?? [], "items"); // → JSON en español para SP
  // (opc) agregados locales si los quieres devolver
  const { totalCalculado } = computeItemsAggregates(items);

  // Validaciones de cabecera
  const tipoEvento = assertString(cot.tipoEvento, "cotizacion.tipoEvento");
  const idTipoEvento =
    cot.idTipoEvento != null
      ? assertPositiveInt(cot.idTipoEvento, "cotizacion.idTipoEvento")
      : null;
  const fechaEvento = assertDate(cot.fechaEvento, "cotizacion.fechaEvento");
  const lugar = cleanString(cot.lugar);
  const horasEstimadas = assertHoras(cot.horasEstimadas);
  const mensaje = cleanString(cot.mensaje);
  const estado = assertEstado(cot.estado);

  const res = await repo.createAdmin({
    lead: {
      id: lead.id ?? null,
      nombre: cleanString(lead.nombre),
      celular: cleanString(lead.celular),
      origen: cleanString(lead.origen) ?? "Backoffice",
    },
    cotizacion: {
      tipoEvento,
      idTipoEvento,
      fechaEvento,
      lugar,
      horasEstimadas,
      mensaje,
      estado,
    },
    items,
  });

  return {
    Status: "Registro exitoso",
    cotizacionId: res.idCotizacion,
    totalCalculado,
    itemsCreados: items.length,
  };
}

// Actualiza por admin (parcial; si envías items, reemplaza todo el set)
async function update(id, payload = {}) {
  const cotizacionId = assertPositiveInt(id, "id");

  const cot = payload.cotizacion || {};
  const items =
    payload.items !== undefined
      ? normalizeItemsInput(payload.items, "items")
      : undefined;

  // Validaciones parciales (pueden ir null → COALESCE en SP conserva)
  const p = {};
  if ("tipoEvento" in cot)
    p.tipoEvento = assertString(cot.tipoEvento, "cotizacion.tipoEvento");
  if ("idTipoEvento" in cot)
    p.idTipoEvento =
      cot.idTipoEvento == null
        ? null
        : assertPositiveInt(cot.idTipoEvento, "cotizacion.idTipoEvento");
  if ("fechaEvento" in cot)
    p.fechaEvento = assertDate(cot.fechaEvento, "cotizacion.fechaEvento");
  if ("lugar" in cot) p.lugar = cleanString(cot.lugar);
  if ("horasEstimadas" in cot)
    p.horasEstimadas = assertHoras(cot.horasEstimadas);
  if ("mensaje" in cot) p.mensaje = cleanString(cot.mensaje);
  if ("estado" in cot) p.estado = assertEstado(cot.estado);

  await repo.updateAdmin(cotizacionId, {
    cotizacion: p,
    items, // si es array → SP reemplaza; si undefined → no toca ítems; si null → borra todos (envía [] si quieres set vacío)
  });

  return { Status: "Actualización exitosa" };
}

async function remove(id) {
  const cotizacionId = assertPositiveInt(id, "id");
  const result = await repo.deleteById(cotizacionId);
  if (!result.deleted) {
    const err = new Error(`Cotización ${cotizacionId} no encontrada`);
    err.status = 404;
    throw err;
  }
  return { Status: "Eliminación exitosa", leadEliminado: result.leadDeleted };
}
// cotizacion.service.js
async function cambiarEstadoOptimista(id, { estadoNuevo, estadoEsperado }) {
  const cotizacionId = assertPositiveInt(id, "id");
  const nuevo = assertEstado(estadoNuevo);
  const esperado = assertEstado(estadoEsperado);

  try {
    const { detalle } = await repo.cambiarEstado(cotizacionId, {
      estadoNuevo: nuevo,
      estadoEsperado: esperado,
    });
    return {
      Status: "Estado actualizado",
      estado: nuevo,
      detalle, // ← ya viene con: id, estado, fechaCreacion, eventoId, tipoEvento, fechaEvento, lugar, horasEstimadas, mensaje, total, lead{...}
    };
  } catch (err) {
    const msg = String(
      err && (err.sqlMessage || err.message || "")
    ).toLowerCase();
    if (msg.includes("version conflict")) {
      const e = badRequest(
        "Conflicto de versión: el estado cambió antes de tu actualización"
      );
      e.status = 409;
      throw e;
    }
    throw err;
  }
}
module.exports = {
  list,
  findById,
  createPublic,
  createAdmin,
  update,
  remove,
  buildPdfDefinition,
  createPdfDocument,
  mapDetailToPdfPayload,
  streamPdf,
  cambiarEstadoOptimista,
};
