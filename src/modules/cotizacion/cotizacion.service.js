const PdfPrinter = require("pdfmake");
const logger = require("../../utils/logger");
const repo = require("./cotizacion.repository");
const pool = require("../../db");
const { generarCotizacionPdf } = require("../../pdf/cotizacion");

const ESTADOS_VALIDOS = new Set(["Borrador", "Enviada", "Aceptada", "Rechazada"]);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const PDF_FONTS = {
  Helvetica: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
};

// ───────── utils ─────────
function badRequest(message){ const err=new Error(message); err.status=400; return err; }
function assertPositiveInt(v,f){ const n=Number(v); if(!Number.isInteger(n)||n<=0) throw badRequest(`${f} inválido`); return n; }
function assertNonNegativeInt(v,f){ const n=Number(v); if(!Number.isInteger(n)||n<0) throw badRequest(`${f} inválido (debe ser entero ≥ 0)`); return n; }
function assertNumberNonNeg(v,f){ const n=Number(v); if(!Number.isFinite(n)||n<0) throw badRequest(`${f} inválido (debe ser número ≥ 0)`); return Number(n.toFixed(2)); }
function assertString(v,f){ if(typeof v!=="string"||!v.trim()) throw badRequest(`Campo '${f}' es requerido`); return v.trim(); }
function cleanString(v){ if(v==null) return null; const t=String(v).trim(); return t===""?null:t; }
function assertDate(v,f){ if(v==null) return null; if(typeof v!=="string"||!ISO_DATE.test(v)) throw badRequest(`Campo '${f}' debe ser YYYY-MM-DD`); return v; }
function assertHoras(v){ if(v==null) return null; const n=Number(v); if(!Number.isFinite(n)||n<0) throw badRequest("horasEstimadas debe ser numérico positivo"); return Number(n.toFixed(1)); }
function assertEstado(v){ if(v==null) return "Borrador"; const e=String(v).trim(); if(!ESTADOS_VALIDOS.has(e)) throw badRequest(`estado inválido. Valores permitidos: ${[...ESTADOS_VALIDOS].join(", ")}`); return e; }
function assertCurrency3(v,f){ const s=String(v||"").trim().toUpperCase(); if(!/^[A-Z]{3}$/.test(s)) throw badRequest(`Campo '${f}' debe ser un código de moneda ISO de 3 letras`); return s; }
function assertArray(v,f){ if(!Array.isArray(v)) throw badRequest(`Campo '${f}' debe ser un arreglo`); return v; }

// ───────── pdfmake (compat) ─────────
function bulletsBlock(values=[]){ const list=Array.isArray(values)?values.filter(Boolean):[]; if(!list.length) return [{text:"-  --"}]; return list.map(text=>({text:`-  ${text}`})); }
function buildPdfDefinition(payload={}){ return { pageSize:"A4", pageMargins:[50,40,50,50], defaultStyle:{font:"Helvetica",fontSize:10}, content:[{text:"(Plantilla pdfmake de respaldo)", italics:true}], }; }
function createPdfDocument(payload={}){ const printer=new PdfPrinter(PDF_FONTS); const definition=buildPdfDefinition(payload); return printer.createPdfKitDocument(definition); }

// ───────── repo passthrough ─────────
async function findById(id){
  const n = assertPositiveInt(id,"id");
  const data = await repo.findByIdWithItems(n);
  if(!data){ const err=new Error(`Cotización ${n} no encontrada`); err.status=404; throw err; }
  return data;
}

// ───────── STREAM PDF ─────────
function toBullets(desc){ if(!desc) return []; return String(desc).split(/\r?\n|●|- |•|·|\u2022|\. /).map(s=>s.trim()).filter(Boolean); }

async function streamPdf({ id, res, body, mode, raw } = {}) {
  const cotizacionId = assertPositiveInt(id, "id");

  const detail = await repo.findByIdWithItems(cotizacionId);
  if (!detail) { const err = new Error(`Cotización ${cotizacionId} no encontrada`); err.status = 404; throw err; }

  // Normaliza items y saca "personal" (CS_Staff)
  const rawItems = Array.isArray(detail.items) ? detail.items : [];
  const norm = rawItems.map((it) => {
    const titulo = it.titulo ?? it.nombre ?? it.CS_Nombre ?? it.cs_nombre ?? "";
    const descripcion = it.descripcion ?? it.CS_Descripcion ?? it.cs_descripcion ?? "";
    const moneda = (it.moneda ?? it.CS_Moneda ?? it.cs_moneda ?? "USD").toString().toUpperCase();
    const cantidad = Number(it.cantidad ?? it.CS_Cantidad ?? it.cs_cantidad ?? 1);
    const precioUnitario = Number(it.precioUnitario ?? it.precioUnit ?? it.CS_PrecioUnit ?? it.cs_preciounit ?? 0);
    const horas = it.horas ?? it.CS_Horas ?? it.cs_horas ?? null;
    const notas = it.notas ?? it.CS_Notas ?? it.cs_notas ?? "";
    const personal = it.personal ?? it.CS_Staff ?? it.cs_staff ?? null;
    const fotosImpresas = Number(it.fotosImpresas ?? it.CS_FotosImpresas ?? it.cs_fotosimpresas ?? 0) || 0;
    const trailerMin   = Number(it.trailerMin   ?? it.CS_TrailerMin   ?? it.cs_trailermin   ?? 0) || 0;
    const filmMin      = Number(it.filmMin      ?? it.CS_FilmMin      ?? it.cs_filmmin      ?? 0) || 0;

    return {
      titulo: String(titulo || "").trim(),
      descripcion: String(descripcion || "").trim(),
      moneda,
      cantidad: Number.isFinite(cantidad) ? cantidad : 1,
      precioUnitario: Number.isFinite(precioUnitario) ? precioUnitario : 0,
      horas: Number.isFinite(Number(horas)) ? Number(horas) : null,
      notas: String(notas || "").trim(),
      personal: Number.isFinite(Number(personal)) ? Number(personal) : null,
      fotosImpresas, trailerMin, filmMin,
    };
  });

  // Clasifica por heurística simple
  const foto = [], video = [], extrasFoto = [], extrasVideo = [];
  const keywordCat = (t, d, fi, tr, fm) => {
    if ((tr||0) > 0 || (fm||0) > 0) return "video";
    if ((fi||0) > 0) return "foto";
    const txt = `${t} ${d}`.toLowerCase();
    if (/(video|filmación|filmacion|tráiler|trailer|reporte|4k|cámara de video)/i.test(txt)) return "video";
    if (/(foto|fotografía|fotografia|photobook|álbum|album)/i.test(txt)) return "foto";
    return "otro";
  };
  for (const it of norm) {
    const cat = keywordCat(it.titulo, it.descripcion, it.fotosImpresas, it.trailerMin, it.filmMin);
    const base = {
      titulo: it.titulo,
      bullets: toBullets(it.descripcion),
      horas: it.horas ?? null,
      notas: it.notas ?? "",
      personal: it.personal ?? null,
      cantidad: it.cantidad ?? 1,
      precioUnitario: it.precioUnitario ?? 0,
      moneda: it.moneda || "USD",
    };
    if (cat === "video") video.push(base);
    else if (cat === "foto") foto.push(base);
    else if (/video/i.test(it.titulo)) extrasVideo.push(base);
    else extrasFoto.push(base);
  }
  if (foto.length === 0 && video.length === 0 && norm.length > 0) {
    video.push(...norm.map(it => ({
      titulo: it.titulo,
      bullets: toBullets(it.descripcion),
      horas: it.horas ?? null,
      notas: it.notas ?? "",
      personal: it.personal ?? null,
      cantidad: it.cantidad ?? 1,
      precioUnitario: it.precioUnitario ?? 0,
      moneda: it.moneda || "USD"
    })));
  }

  // Cabecera para PDF (DB + overrides desde body)
  const cabecera = {
    atencion: detail.leadNombre || detail.lead?.nombre || "Cliente",
    evento: detail.cotizacion?.tipoEvento || detail.tipoEvento || "evento",
    fechaEvento: detail.cotizacion?.fechaEvento || detail.fechaEvento || null,
    lugar: detail.cotizacion?.lugar || detail.lugar || "",
    // valores por defecto desde DB…
    logoBase64: detail.company?.logoBase64 || null,
    firmaBase64: detail.company?.firmaBase64 || null,
    videoEquipo: detail.cotizacion?.videoEquipo || detail.videoEquipo || null,
    createdAt: detail.cotizacion?.fechaCreacion || detail.fechaCreacion || new Date()
  };

  // …y sobreescrituras desde el body del front (si vienen)
  if (body && typeof body === "object") {
    if (body.company) {
      if (body.company.logoBase64) cabecera.logoBase64 = body.company.logoBase64;
      if (body.company.firmaBase64) cabecera.firmaBase64 = body.company.firmaBase64;
    }
    if (body.videoEquipo) cabecera.videoEquipo = body.videoEquipo;
  }

  const selecciones = { foto, video, extrasFoto, extrasVideo };

  // diag/raw (opcional)
  if (String(mode||"").toLowerCase()==="diag") {
    const PDFDocument = require("pdfkit");
    const doc = new PDFDocument({ size:"A4", margin: 40 });
    res.setHeader("Content-Type","application/pdf");
    res.setHeader("Content-Disposition",`inline; filename="cotizacion_${cotizacionId}_diag.pdf"`);
    doc.pipe(res);
    doc.font("Helvetica-Bold").fontSize(16).text("Diagnóstico PDF", { align:"center" }).moveDown();
    doc.fontSize(11).font("Helvetica").text(`Foto: ${foto.length} | Video: ${video.length}`);
    doc.end();
    return;
  }
  if (raw === "1") { res.status(200).json({ items: norm }); return; }

  const buffer = await generarCotizacionPdf({ cabecera, selecciones });
  res.status(200);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="cotizacion_${cotizacionId}.pdf"`);
  res.end(buffer);
}

/** ====== REST no tocado ====== */
async function list({ estado } = {}) {
  const rows = await repo.listAll({ estado });

  return rows.map((r) => {
    // Construimos el bloque 'contacto' a partir de lo que venga del repo/SP
    const contacto = r.contacto ?? (
      r.origen ? {
        id: r.origen === 'CLIENTE'
          ? (r.clienteId ?? r.idCliente ?? null)
          : (r.leadId ?? r.idLead ?? null),
        origen: r.origen,
        nombre: r.contactoNombre ?? r.leadNombre ?? r.nombre ?? r.Lead_Nombre ?? null,
        celular: r.contactoCelular ?? r.leadCelular ?? r.celular ?? r.Lead_Celular ?? null,
      } : undefined
    );

    return {
      id: r.id ?? r.idCotizacion ?? r.cotizacion_id ?? r.PK_Cot_Cod,
      estado: r.estado ?? r.Cot_Estado,
      fechaCreacion: r.fechaCreacion ?? r.Cot_Fecha_Crea,

      // 🔹 asegúrate de poblar eventoId (desde idTipoEvento en el SP)
      eventoId: r.eventoId ?? r.idTipoEvento ?? r.Cot_IdTipoEvento ?? null,
      tipoEvento: r.tipoEvento ?? r.Cot_TipoEvento,
      fechaEvento: r.fechaEvento ?? r.Cot_FechaEvento,
      lugar: r.lugar ?? r.Cot_Lugar,

      // 🔹 coerces numéricos a Number
      horasEstimadas:
        r.horasEstimadas != null ? Number(r.horasEstimadas)
        : (r.Cot_HorasEst != null ? Number(r.Cot_HorasEst) : null),

      mensaje: r.mensaje ?? r.Cot_Mensaje,
      total:
        r.total != null ? Number(r.total)
        : (r.cot_total != null ? Number(r.cot_total) : null),

      // 🔥 solo incluimos 'contacto' si existe; no exponemos 'lead'
      ...(contacto ? { contacto } : {}),
    };
  });
}


module.exports = {
  list,
  findById,
  buildPdfDefinition,
  createPdfDocument,
  streamPdf,
  // Nuevos métodos usados por el controller
  async createPublic(payload = {}) {
    if (!payload || typeof payload !== "object") throw badRequest("Body inválido");
    const { lead, cotizacion } = payload;
    // Validaciones mínimas (el SP también valida)
    assertString(lead?.nombre ?? "", "lead.nombre");
    assertString(cotizacion?.tipoEvento ?? "", "cotizacion.tipoEvento");
    assertDate(cotizacion?.fechaEvento, "cotizacion.fechaEvento");
    return await repo.createPublic({ lead, cotizacion });
  },
  async createAdmin(payload = {}) {
    if (!payload || typeof payload !== "object") throw badRequest("Body inválido");
    return await repo.createAdmin(payload);
  },
  async update(id, body = {}) {
    const nId = assertPositiveInt(id, "id");
    if (!body || typeof body !== "object") throw badRequest("Body inválido");
    return await repo.updateAdmin(nId, body);
  },
  async remove(id) {
    const nId = assertPositiveInt(id, "id");
    return await repo.deleteById(nId);
  },
  async cambiarEstadoOptimista(id, { estadoNuevo, estadoEsperado } = {}) {
    const nId = assertPositiveInt(id, "id");
    const nuevo = assertEstado(estadoNuevo);
    const esperado = estadoEsperado == null ? null : assertEstado(estadoEsperado);
    return await repo.cambiarEstado(nId, { estadoNuevo: nuevo, estadoEsperado: esperado });
  },
};
