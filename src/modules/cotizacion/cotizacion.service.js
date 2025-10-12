// src/modules/cotizacion/cotizacion.service.js
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

// ───────── helpers ─────────
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
function toBullets(desc){ if(!desc) return []; return String(desc).split(/\r?\n|●|- |•|·|\u2022|\. /).map(s=>s.trim()).filter(Boolean); }

// ───────── pdfmake fallback ─────────
function buildPdfDefinition(payload={}){ return { pageSize:"A4", pageMargins:[50,40,50,50], defaultStyle:{font:"Helvetica",fontSize:10}, content:[{text:"(Plantilla pdfmake de respaldo)", italics:true}], }; }
function createPdfDocument(payload={}){ const printer=new PdfPrinter(PDF_FONTS); const definition=buildPdfDefinition(payload); return printer.createPdfKitDocument(definition); }

// ───────── repo passthrough ─────────
async function findById(id){
  const n = assertPositiveInt(id,"id");
  const data = await repo.findByIdWithItems(n);
  if(!data){ const err=new Error(`Cotización ${n} no encontrada`); err.status=404; throw err; }
  return data;
}

// ───────── equipo (si existe mapeo adicional) ─────────
async function fetchEquipo(cotId) {
  const [t1] = await pool.query(`
    SELECT COUNT(*) AS n
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name IN ('T_CotizacionEmpleado','T_CotizacionEquipo')
  `);
  const hayTablaAsign = (t1?.[0]?.n || 0) > 0;
  if (!hayTablaAsign) return [];
  const [rows] = await pool.query(`
    SELECT 
      COALESCE(e.Emp_Nombre, e.nombre, e.fullname)   AS nombre,
      COALESCE(ce.Rol, ce.rol, ce.Cargo, ce.cargo)   AS rol,
      COALESCE(e.Emp_Celular, e.celular, e.telefono) AS celular
    FROM T_CotizacionEmpleado ce
    JOIN T_Empleado e ON e.PK_Emp_Cod = ce.FK_Emp_Cod
    WHERE ce.FK_Cot_Cod = ?
    UNION ALL
    SELECT 
      COALESCE(e.Emp_Nombre, e.nombre, e.fullname)   AS nombre,
      COALESCE(ce.Rol, ce.rol, ce.Cargo, ce.cargo)   AS rol,
      COALESCE(e.Emp_Celular, e.celular, e.telefono) AS celular
    FROM T_CotizacionEquipo ce
    JOIN T_Empleado e ON e.PK_Emp_Cod = ce.FK_Emp_Cod
    WHERE ce.FK_Cot_Cod = ?
  `, [cotId, cotId]);
  return Array.isArray(rows) ? rows : [];
}

// ───────── cabecera ─────────
function buildCabeceraFromDetail(detail){
  const atencion = detail.leadNombre || detail.lead?.nombre || "Cliente";
  const fecha = detail.fechaEvento ? new Date(detail.fechaEvento).toLocaleDateString() : null;
  const lugar = detail.lugar ? `, ${detail.lugar}` : "";
  return {
    atencion,
    mensajeIntro: "Cotización para realización de fotografía y video.",
    lugarFecha: fecha ? `Se realizará el ${fecha}${lugar}` : (detail.lugar || ""),
  };
}

// ───────── stream PDF ─────────
async function streamPdf({ id, res, mode, raw } = {}) {
  const cotizacionId = assertPositiveInt(id, "id");
  const detail = await repo.findByIdWithItems(cotizacionId);
  if (!detail) { const err = new Error(`Cotización ${cotizacionId} no encontrada`); err.status = 404; throw err; }

  // normaliza ítems (incluye CS_Staff -> personal)
  const rawItems = Array.isArray(detail.items) ? detail.items : [];
  const norm = rawItems.map((it) => {
    const titulo = it.titulo ?? it.nombre ?? it.CS_Nombre ?? it.cs_nombre ?? "";
    const descripcion = it.descripcion ?? it.CS_Descripcion ?? it.cs_descripcion ?? "";
    const moneda = (it.moneda ?? it.CS_Moneda ?? it.cs_moneda ?? "USD").toString().toUpperCase();
    const cantidad = Number(it.cantidad ?? it.CS_Cantidad ?? it.cs_cantidad ?? 1);
    const precioUnitario = Number(it.precioUnitario ?? it.precioUnit ?? it.CS_PrecioUnit ?? it.cs_preciounit ?? 0);
    const horas = it.horas ?? it.CS_Horas ?? it.cs_horas ?? null;
    const notas = it.notas ?? it.CS_Notas ?? it.cs_notas ?? "";
    const fotosImpresas = Number(it.fotosImpresas ?? it.CS_FotosImpresas ?? it.cs_fotosimpresas ?? 0) || 0;
    const trailerMin   = Number(it.trailerMin   ?? it.CS_TrailerMin   ?? it.cs_trailermin   ?? 0) || 0;
    const filmMin      = Number(it.filmMin      ?? it.CS_FilmMin      ?? it.cs_filmmin      ?? 0) || 0;
    const personal     = Number(it.personal     ?? it.CS_Staff        ?? it.cs_staff        ?? 0) || 0; // <-- ESTÁTICO

    return {
      titulo: String(titulo || "").trim(),
      descripcion: String(descripcion || "").trim(),
      moneda,
      cantidad: Number.isFinite(cantidad) ? cantidad : 1,
      precioUnitario: Number.isFinite(precioUnitario) ? precioUnitario : 0,
      horas: Number.isFinite(Number(horas)) ? Number(horas) : null,
      notas: String(notas || "").trim(),
      fotosImpresas, trailerMin, filmMin,
      personal, // <-- para el PDF
    };
  });

  if (raw === "1") { res.status(200).json({ items: norm }); return; }

  // clasifica por palabras clave/señales
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
      cantidad: it.cantidad ?? 1,
      precioUnitario: it.precioUnitario ?? 0,
      moneda: it.moneda || "USD",
      personal: it.personal ?? 0, // <-- SE PASA
    };
    if (cat === "video") video.push(base);
    else if (cat === "foto") foto.push(base);
    else if (/video/i.test(it.titulo)) extrasVideo.push(base);
    else extrasFoto.push(base);
  }
  if (foto.length === 0 && video.length === 0 && norm.length > 0) {
    for (const it of norm) {
      video.push({
        titulo: it.titulo,
        bullets: toBullets(it.descripcion),
        horas: it.horas ?? null,
        notas: it.notas ?? "",
        cantidad: it.cantidad ?? 1,
        precioUnitario: it.precioUnitario ?? 0,
        moneda: it.moneda || "USD",
        personal: it.personal ?? 0,
      });
    }
  }

  // cabecera + equipo
  const cabecera = buildCabeceraFromDetail(detail);
  const selecciones = { foto, video, extrasFoto, extrasVideo };
  const equipo = await fetchEquipo(cotizacionId); // si no hay, OK

  const buffer = await generarCotizacionPdf({ cabecera, selecciones, equipo });
  res.status(200);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="cotizacion_${cotizacionId}.pdf"`);
  res.end(buffer);
}

// ───────── REST (sin cambios relevantes) ─────────
async function list({ estado } = {}){ const filtroEstado = estado ? assertEstado(estado) : undefined; const rows = await repo.listAll({ estado: filtroEstado }); return rows.map(mapRowList); }
function mapRowList(r){
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
  const lead = {
    id: r.leadId ?? r.idLead ?? r.PK_Lead_Cod,
    nombre: r.leadNombre ?? r.nombre ?? r.Lead_Nombre,
    celular: r.leadCelular ?? r.celular ?? r.Lead_Celular,
    origen: r.leadOrigen ?? r.origen ?? r.Lead_Origen,
    fechaCreacion: r.leadFechaCreacion ?? r.Lead_Fecha_Crea,
  };
  return { id, estado, fechaCreacion, eventoId, tipoEvento, fechaEvento, lugar, horasEstimadas, mensaje, total, lead };
}

async function createPublic(payload={}){ 
  const lead=payload.lead||{};
  const cot=payload.cotizacion||{};
  const nombre=assertString(lead.nombre,"lead.nombre");
  const celular=cleanString(lead.celular);
  const origen=cleanString(lead.origen)??"Web";
  const tipoEvento=assertString(cot.tipoEvento,"cotizacion.tipoEvento");
  const idTipoEvento=cot.idTipoEvento!=null?assertPositiveInt(cot.idTipoEvento,"cotizacion.idTipoEvento"):null;
  const fechaEvento=assertDate(cot.fechaEvento,"cotizacion.fechaEvento");
  const lugar=cleanString(cot.lugar);
  const horasEstimadas=assertHoras(cot.horasEstimadas);
  const mensaje=cleanString(cot.mensaje);
  const result=await repo.createPublic({ lead:{nombre,celular,origen}, cotizacion:{ tipoEvento,idTipoEvento,fechaEvento,lugar,horasEstimadas,mensaje } });
  return { Status:"Registro exitoso", ...result };
}

function computeItemsAggregates(items=[]){
  const totalCalculado = Number(items.reduce((acc,it)=>acc+(it.precioUnit??0)*(it.cantidad??0),0).toFixed(2));
  const horasTotales   = items.reduce((a,it)=>a+(it.horas??0)*(it.cantidad??1),0);
  const personalTotal  = items.reduce((a,it)=>a+(it.personal??0)*(it.cantidad??1),0);
  return { totalCalculado, horasTotales, personalTotal };
}

async function createAdmin(payload={}){ 
  const lead=payload.lead||{};
  const cot=payload.cotizacion||{};
  const items=assertArray(payload.items??[],"items").map((it,idx)=>{
    const base=`items[${idx}]`;
    const idEventoServicio = assertPositiveInt(it.idEventoServicio ?? it.exsId, `${base}.idEventoServicio`);
    const titulo   = assertString(it.titulo ?? it.nombre, `${base}.titulo`);
    const descripcion = cleanString(it.descripcion);
    const moneda   = assertCurrency3(it.moneda, `${base}.moneda`);
    const precioUnitario = assertNumberNonNeg(it.precioUnitario ?? it.precioUnit, `${base}.precioUnitario`);
    const cantidad = assertPositiveInt(it.cantidad ?? 1, `${base}.cantidad`);
    const notas    = cleanString(it.notas);
    const horas    = it.horas==null?null:assertNonNegativeInt(it.horas, `${base}.horas`);
    const personal = it.personal==null?null:assertNonNegativeInt(it.personal, `${base}.personal`);
    const fotosImpresas = it.fotosImpresas==null?null:assertNonNegativeInt(it.fotosImpresas, `${base}.fotosImpresas`);
    const trailerMin = it.trailerMin==null?null:assertNonNegativeInt(it.trailerMin, `${base}.trailerMin`);
    const filmMin    = it.filmMin==null?null:assertNonNegativeInt(it.filmMin, `${base}.filmMin`);
    return { idEventoServicio, nombre: titulo, descripcion, moneda, precioUnit: precioUnitario, cantidad, descuento:0, recargo:0, notas, horas, personal, fotosImpresas, trailerMin, filmMin };
  });
  const { totalCalculado } = computeItemsAggregates(items);
  const tipoEvento=assertString(cot.tipoEvento,"cotizacion.tipoEvento");
  const idTipoEvento=cot.idTipoEvento!=null?assertPositiveInt(cot.idTipoEvento,"cotizacion.idTipoEvento"):null;
  const fechaEvento=assertDate(cot.fechaEvento,"cotizacion.fechaEvento");
  const lugar=cleanString(cot.lugar);
  const horasEstimadas=assertHoras(cot.horasEstimadas);
  const mensaje=cleanString(cot.mensaje);
  const estado=assertEstado(cot.estado);
  const res=await repo.createAdmin({ 
    lead:{ id:lead.id??null, nombre:cleanString(lead.nombre), celular:cleanString(lead.celular), origen:cleanString(lead.origen)??"Backoffice" },
    cotizacion:{ tipoEvento,idTipoEvento,fechaEvento,lugar,horasEstimadas,mensaje,estado },
    items,
  });
  return { Status:"Registro exitoso", cotizacionId: res.idCotizacion, totalCalculado, itemsCreados: items.length };
}

async function update(id,payload={}){ 
  const cotizacionId=assertPositiveInt(id,"id");
  const cot=payload.cotizacion||{};
  const items=payload.items!==undefined?payload.items:undefined;
  const p={};
  if("tipoEvento" in cot) p.tipoEvento=assertString(cot.tipoEvento,"cotizacion.tipoEvento");
  if("idTipoEvento" in cot) p.idTipoEvento=cot.idTipoEvento==null?null:assertPositiveInt(cot.idTipoEvento,"cotizacion.idTipoEvento");
  if("fechaEvento" in cot) p.fechaEvento=assertDate(cot.fechaEvento,"cotizacion.fechaEvento");
  if("lugar" in cot) p.lugar=cleanString(cot.lugar);
  if("horasEstimadas" in cot) p.horasEstimadas=assertHoras(cot.horasEstimadas);
  if("mensaje" in cot) p.mensaje=cleanString(cot.mensaje);
  if("estado" in cot) p.estado=assertEstado(cot.estado);
  await repo.updateAdmin(cotizacionId,{ cotizacion:p, items });
  return { Status:"Actualización exitosa" };
}

async function remove(id){ 
  const cotizacionId=assertPositiveInt(id,"id");
  const result=await repo.deleteById(cotizacionId);
  if(!result.deleted){ const err=new Error(`Cotización ${cotizacionId} no encontrada`); err.status=404; throw err; }
  return { Status:"Eliminación exitosa", leadEliminado: result.leadDeleted };
}

async function cambiarEstadoOptimista(id,{estadoNuevo,estadoEsperado}){ 
  const cotizacionId=assertPositiveInt(id,"id");
  const nuevo=assertEstado(estadoNuevo);
  const esperado=assertEstado(estadoEsperado);
  try{
    const { detalle }=await repo.cambiarEstado(cotizacionId,{ estadoNuevo:nuevo, estadoEsperado:esperado });
    return { Status:"Estado actualizado", estado:nuevo, detalle };
  } catch(err){
    const msg=String(err && (err.sqlMessage||err.message||"")).toLowerCase();
    if(msg.includes("version conflict")){ const e=badRequest("Conflicto de versión: el estado cambió antes de tu actualizacion"); e.status=409; throw e; }
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
  streamPdf,
  cambiarEstadoOptimista,
};
