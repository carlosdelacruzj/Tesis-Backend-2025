const repo = require("./cotizacion.repository");
//const { generarCotizacionPdf } = require("../../pdf/cotizacion");
//const { generarCotizacionPdfV2 } = require("../../pdf/cotizacion_v2");
const path = require("path");
const { generatePdfBufferFromDocxTemplate } = require("../../pdf/wordToPdf");
const { formatCodigo } = require("../../utils/codigo");
const { getLimaDate, getLimaISODate } = require("../../utils/dates");

const ESTADOS_VALIDOS = new Set(["Borrador", "Enviada", "Aceptada", "Rechazada"]);
const ESTADOS_ABIERTOS = new Set(["Borrador", "Enviada"]);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const isEnabled = (value) => ["1", "true", "yes", "on"].includes(String(value ?? "0").toLowerCase());
const COTIZACIONES_MODO_ESTRICTO = isEnabled(process.env.COTIZACIONES_MODO_ESTRICTO);
const AUTO_EXPIRACION_COTIZACIONES =
  COTIZACIONES_MODO_ESTRICTO || isEnabled(process.env.COTIZACIONES_AUTO_EXPIRACION);
const VALIDAR_ACEPTACION_ANTES_EVENTO =
  COTIZACIONES_MODO_ESTRICTO || isEnabled(process.env.COTIZACIONES_VALIDAR_ACEPTACION_ANTES_EVENTO);
const VALIDAR_BLOQUEO_EVENTO_VENCIDO =
  COTIZACIONES_MODO_ESTRICTO || isEnabled(process.env.COTIZACIONES_VALIDAR_BLOQUEO_EVENTO_VENCIDO ?? "1");

const fs = require("fs");

// â”€â”€â”€â”€â”€â”€â”€â”€â”€ utils â”€â”€â”€â”€â”€â”€â”€â”€â”€
function badRequest(message){ const err=new Error(message); err.status=400; return err; }
function assertPositiveInt(v,f){ const n=Number(v); if(!Number.isInteger(n)||n<=0) throw badRequest(`${f} invÃ¡lido`); return n; }
function assertOptionalPositiveInt(v,f){ if(v==null) return null; return assertPositiveInt(v,f); }
function assertOptionalNonNegativeNumber(v,f){ if(v==null) return null; const n=Number(v); if(!Number.isFinite(n)||n<0) throw badRequest(`${f} invÃ¡lido`); return n; }
function assertString(v,f){ if(typeof v!=="string"||!v.trim()) throw badRequest(`Campo '${f}' es requerido`); return v.trim(); }
function assertDate(v,f){ if(v==null) return null; if(typeof v!=="string"||!ISO_DATE.test(v)) throw badRequest(`Campo '${f}' debe ser YYYY-MM-DD`); return v; }
function assertEstado(v){ if(v==null) return "Borrador"; const e=String(v).trim(); if(!ESTADOS_VALIDOS.has(e)) throw badRequest(`estado invÃ¡lido. Valores permitidos: ${[...ESTADOS_VALIDOS].join(", ")}`); return e; }

function normalizeViaticos(cotizacion) {
  if (!cotizacion || typeof cotizacion !== "object") return;
  if (cotizacion.viaticosCliente === true) {
    cotizacion.viaticosMonto = 0;
  }
}

function formatDateDMY(value) {
  if (!value) return "";
  const s = String(value).trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return s;
  return `${m[3]}/${m[2]}/${m[1]}`; // DD/MM/AAAA
}

function applyFechaEventoFromEventos(cotizacion, eventos) {
  if (!cotizacion || typeof cotizacion !== "object") return;
  if (!Array.isArray(eventos) || eventos.length == 0) return;
  const fechas = eventos
    .map((e) => (e && e.fecha ? String(e.fecha).trim() : ""))
    .filter(Boolean)
    .filter((f) => ISO_DATE.test(f));
  if (fechas.length == 0) return;
  fechas.sort();
  cotizacion.fechaEvento = fechas[0];
}

function joinEquiposTexto(arr = []) {
  // arr viene como [{nombre, detalle}]
  // Ej: "Cámara x2 — 24-70mm; Flash x1"
  return (arr || [])
    .map((x) => {
      const n = normalizeText(x?.nombre);
      const d = normalizeText(x?.detalle);
      return d ? `${n} ${d}`.trim() : n;
    })
    .filter(Boolean)
    .join("; ");
}

function normalizeServiciosFechas(serviciosFechas) {
  if (serviciosFechas == null) return null;
  if (!Array.isArray(serviciosFechas)) throw badRequest("Campo 'serviciosFechas' debe ser un arreglo");
  return serviciosFechas.map((sf, idx) => {
    if (!sf || typeof sf !== "object") throw badRequest(`serviciosFechas[${idx}] invalido`);
    const fecha = assertDate(sf.fecha, `serviciosFechas[${idx}].fecha`);
    const itemTmpId = sf.itemTmpId != null ? String(sf.itemTmpId).trim() : null;
    const idCotizacionServicio =
      sf.idCotizacionServicio != null ? Number(sf.idCotizacionServicio) : null;
    if (!itemTmpId && !idCotizacionServicio) {
      throw badRequest(
        `serviciosFechas[${idx}] requiere 'itemTmpId' o 'idCotizacionServicio'`
      );
    }
    if (idCotizacionServicio != null && !Number.isInteger(idCotizacionServicio)) {
      throw badRequest(`serviciosFechas[${idx}].idCotizacionServicio invalido`);
    }
    return { itemTmpId, idCotizacionServicio, fecha };
  });
}

function buildTmpIdMap(items, rows) {
  const tmpIndex = new Map();
  (items || []).forEach((it, idx) => {
    if (it?.tmpId == null) return;
    const key = String(it.tmpId).trim();
    if (!key) return;
    if (tmpIndex.has(key)) throw badRequest(`tmpId duplicado: ${key}`);
    tmpIndex.set(key, idx);
  });
  if (tmpIndex.size === 0) return null;
  if (!Array.isArray(rows) || rows.length < (items || []).length) {
    throw badRequest("No se pudo mapear los items creados");
  }
  const map = new Map();
  for (const [key, idx] of tmpIndex.entries()) {
    const row = rows[idx];
    if (!row?.idCotizacionServicio) {
      throw badRequest(`No se pudo mapear item '${key}'`);
    }
    map.set(key, row.idCotizacionServicio);
  }
  return map;
}

function validateFechasAgainstEventos(serviciosFechas, eventos) {
  if (!Array.isArray(eventos)) return;
  const fechas = new Set(
    eventos.map((e) => (e?.fecha ? String(e.fecha).trim() : "")).filter(Boolean)
  );
  for (const sf of serviciosFechas) {
    if (!fechas.has(sf.fecha)) {
      throw badRequest(`Fecha no existe en eventos: ${sf.fecha}`);
    }
  }
}

function toHHmm(value) {
  if (!value) return "";
  const s = String(value).trim();
  // soporta "HH:mm", "HH:mm:ss", "HH:mm:ss.ffffff"
  const m = s.match(/^(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : s;
}

async function applyServiciosFechas(cotizacionId, payload = {}) {
  const normalized = normalizeServiciosFechas(payload.serviciosFechas);
  if (normalized == null) return;

  validateFechasAgainstEventos(normalized, payload.eventos);

  const usesTmpId = normalized.some((sf) => sf.itemTmpId != null);
  let tmpMap = null;
  if (usesTmpId) {
    if (!Array.isArray(payload.items)) {
      throw badRequest("Campo 'items' debe ser un arreglo cuando se usa 'itemTmpId'");
    }
    const rows = await repo.listServiciosByCotizacionId(cotizacionId);
    tmpMap = buildTmpIdMap(payload.items, rows);
  }

  const out = [];
  const seen = new Set();
  for (const sf of normalized) {
    let id = sf.idCotizacionServicio;
    if (!id && sf.itemTmpId && tmpMap) id = tmpMap.get(sf.itemTmpId);
    if (!id) throw badRequest(`No se pudo resolver itemTmpId '${sf.itemTmpId}'`);
    const key = `${id}|${sf.fecha}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ idCotizacionServicio: id, fecha: sf.fecha });
  }

  await repo.replaceServiciosFechas(cotizacionId, out);
}


// â”€â”€â”€â”€â”€â”€â”€â”€â”€ repo passthrough â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function findById(id){
  await rechazarVencidasLocal();
  const n = assertPositiveInt(id,"id");
  const data = await repo.findByIdWithItems(n);
  if(!data){ const err=new Error(`CotizaciÃ³n ${n} no encontrada`); err.status=404; throw err; }
  if(!Array.isArray(data.eventos)) data.eventos = [];
  if(Array.isArray(data.items)){
    data.items = data.items.map((it)=>{
      if(!it||typeof it!=="object") return it;
      return {
        ...it,
        eventoId: it.eventoId==null||it.eventoId===""?null:it.eventoId,
        servicioId: it.servicioId==null||it.servicioId===""?null:it.servicioId,
        eventoServicio: it.eventoServicio ?? null,
      };
    });
  }
  data.serviciosFechas = await repo.listServiciosFechasByCotizacionId(n);
  return data;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€ STREAM PDF â”€â”€â”€â”€â”€â”€â”€â”€â”€
function toBullets(desc) {
  if (!desc) return [];
  return String(desc)
    .split(/\r?\n|â—|- |â€¢|Â·|\u2022|\. /)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseLocalDate(value) {
  if (!value) return null;
  if (typeof value === "string" && ISO_DATE.test(value.trim())) {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d); // evita desfase de -1 dÃ­a en zonas horarias negativas
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function rechazarVencidasLocal() {
  if (!AUTO_EXPIRACION_COTIZACIONES) return;
  await repo.rechazarVencidas(getLimaISODate());
}

function isOnOrBefore(date, ref) {
  return date.getTime() <= ref.getTime();
}

function isEditableFechaEvento(fechaEvento) {
  const date = parseLocalDate(fechaEvento);
  if (!date) return true;
  return !isOnOrBefore(date, getLimaDate());
}

function isAceptableFechaEvento(fechaEvento) {
  const date = parseLocalDate(fechaEvento);
  if (!date) return true;
  const tomorrow = new Date(getLimaDate());
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.getTime() >= tomorrow.getTime();
}
function formatDateDetail(value) {
  if (!value) return "";
  const date = parseLocalDate(value);
  if (!date) return String(value);
  return new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDateLong(value) {
  if (!value) return "";

  // Soporta YYYY-MM-DD o Date/datetime
  let date = null;

  if (typeof value === "string") {
    const s = value.trim();

    // YYYY-MM-DD
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) {
      date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    } else {
      // datetime tipo 2026-02-10T...
      const d2 = new Date(s);
      date = Number.isNaN(d2.getTime()) ? null : d2;
    }
  } else {
    const d = new Date(value);
    date = Number.isNaN(d.getTime()) ? null : d;
  }

  if (!date) return String(value);

  const day = new Intl.DateTimeFormat("es-PE", { day: "2-digit" }).format(date);
  const month = new Intl.DateTimeFormat("es-PE", { month: "long" }).format(date);
  const year = new Intl.DateTimeFormat("es-PE", { year: "numeric" }).format(date);

  return `${day} de ${month} de ${year}`;
}


function uniqueJoin(values = [], joiner = " - ") {
  const uniq = [];
  for (const raw of values) {
    const str = String(raw ?? "").trim();
    if (str && !uniq.includes(str)) uniq.push(str);
  }
  return uniq.join(joiner);
}

async function streamPdf({ id, res } = {}) {
  const cotizacionId = assertPositiveInt(id, "id");

  const detail = await repo.findByIdWithItems(cotizacionId);
  if (!detail) {
    const err = new Error(`Cotización ${cotizacionId} no encontrada`);
    err.status = 404;
    throw err;
  }

  // Por si acaso (tu SP ya devuelve arrays, pero igual)
  if (!Array.isArray(detail.eventos)) detail.eventos = [];
  if (!Array.isArray(detail.items)) detail.items = [];
  if (!detail.cotizacion || typeof detail.cotizacion !== "object") detail.cotizacion = {};

  // ✅ IMPORTANTÍSIMO: para que el Word con {#dias}{#servicios} pinte
  // (si no existe, el loop queda vacío y no muestra nada)
  try {
    const sf = await repo.listServiciosFechasByCotizacionId(cotizacionId);
    detail.serviciosFechas = Array.isArray(sf) ? sf : [];
  } catch {
    detail.serviciosFechas = [];
  }

  // ===================== VIÁTICOS (Opción A: sin tocar SP) =====================
  // - Solo aplica si lugar != "Lima"
  // - viaticosMonto > 0 => incluido (se suma)
  // - viaticosMonto <= 0 => cliente cubre (no se suma)
  const lugarRaw = String(detail.cotizacion?.lugar ?? "").trim();
  const esLima = lugarRaw.toLowerCase() === "lima";

  const vRaw = Number(detail.cotizacion?.viaticosMonto ?? 0);
  const viaticosMonto = Number.isFinite(vRaw) ? vRaw : 0;

  if (esLima) {
    detail.cotizacion.viaticosMonto = 0;
    detail.cotizacion.viaticosClienteCubre = false;
  } else {
    detail.cotizacion.viaticosMonto = viaticosMonto;
    detail.cotizacion.viaticosClienteCubre = viaticosMonto <= 0; // opción A
  }
  // ============================================================================

  // ✅ Mapeo para DOCX
  const templateData = mapSpJsonToTemplateData(detail);

  const templatePath = path.join(
    process.cwd(),
    "src",
    "pdf",
    "templates",
    "cotizacion.docx"
  );

  if (!fs.existsSync(templatePath)) {
    const err = new Error(`Template DOCX no encontrado: ${templatePath}`);
    err.status = 500;
    throw err;
  }

  const pdfBuffer = await generatePdfBufferFromDocxTemplate({
    templatePath,
    data: templateData,
  });

  res.status(200);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="cotizacion_${cotizacionId}.pdf"`
  );
  res.end(pdfBuffer);
}


async function migrarAPedido(id, { empleadoId, nombrePedido } = {}) {
  const cotizacionId = assertPositiveInt(id, "id");
  const empleado = assertPositiveInt(empleadoId, "empleadoId");
  const pedidoNombre = nombrePedido == null ? null : String(nombrePedido);

  return await repo.migrarAPedido({
    cotizacionId,
    empleadoId: empleado,
    nombrePedido: pedidoNombre,
  });
}

/** ====== REST no tocado ====== */
async function list({ estado } = {}) {
  await rechazarVencidasLocal();
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

    const id = r.id ?? r.idCotizacion ?? r.cotizacion_id ?? r.PK_Cot_Cod;
    return {
      id,
      codigo: r.codigo ?? formatCodigo("COT", id),
      estado: r.estado,
      fechaCreacion: r.fechaCreacion ?? r.Cot_Fecha_Crea,

      // ðŸ”¹ asegÃºrate de poblar eventoId (desde idTipoEvento en el SP)
      eventoId: r.eventoId ?? r.idTipoEvento ?? r.Cot_IdTipoEvento ?? null,
      tipoEvento: r.tipoEvento ?? r.Cot_TipoEvento,
      fechaEvento: r.fechaEvento ?? r.Cot_FechaEvento,
      lugar: r.lugar ?? r.Cot_Lugar,

      // ðŸ”¹ coerces numÃ©ricos a Number
      horasEstimadas:
        r.horasEstimadas != null ? Number(r.horasEstimadas)
        : (r.Cot_HorasEst != null ? Number(r.Cot_HorasEst) : null),
      dias:
        r.dias != null ? Number(r.dias)
        : (r.Cot_Dias != null ? Number(r.Cot_Dias) : null),
      viaticosMonto:
        r.viaticosMonto != null ? Number(r.viaticosMonto)
        : (r.Cot_ViaticosMonto != null ? Number(r.Cot_ViaticosMonto) : null),

      mensaje: r.mensaje ?? r.Cot_Mensaje,
      total:
        r.total != null ? Number(r.total)
        : (r.cot_total != null ? Number(r.cot_total) : null),

      // ðŸ”¥ solo incluimos 'contacto' si existe; no exponemos 'lead'
      ...(contacto ? { contacto } : {}),
    };
  });
}

async function createPublic(payload = {}) {
  if (!payload || typeof payload !== "object") throw badRequest("Body invÃ¡lido");
  const { lead, cotizacion } = payload;
  normalizeViaticos(cotizacion);
  applyFechaEventoFromEventos(cotizacion, payload.eventos);
  // Validaciones mÃ­nimas (el SP tambiÃ©n valida)
  assertString(lead?.nombre ?? "", "lead.nombre");
  assertString(cotizacion?.tipoEvento ?? "", "cotizacion.tipoEvento");
  assertDate(cotizacion?.fechaEvento, "cotizacion.fechaEvento");
  if (cotizacion?.dias != null) assertOptionalPositiveInt(cotizacion.dias, "cotizacion.dias");
  if (cotizacion?.viaticosMonto != null)
    assertOptionalNonNegativeNumber(cotizacion.viaticosMonto, "cotizacion.viaticosMonto");
  return await repo.createPublic({ lead, cotizacion });
}

async function createAdmin(payload = {}) {
  if (!payload || typeof payload !== "object") throw badRequest("Body invÃ¡lido");
  if (payload.eventos != null && !Array.isArray(payload.eventos))
    throw badRequest("Campo 'eventos' debe ser un arreglo");
  normalizeViaticos(payload?.cotizacion);
  applyFechaEventoFromEventos(payload?.cotizacion, payload?.eventos);
  if (payload?.cotizacion?.estado != null) {
    assertEstado(payload.cotizacion.estado);
  }
  if (payload?.cotizacion?.dias != null) {
    assertOptionalPositiveInt(payload.cotizacion.dias, "cotizacion.dias");
  }
  if (payload?.cotizacion?.viaticosMonto != null) {
    assertOptionalNonNegativeNumber(payload.cotizacion.viaticosMonto, "cotizacion.viaticosMonto");
  }
  const created = await repo.createAdmin(payload);
  await applyServiciosFechas(created.idCotizacion, payload);
  return created;
}

async function update(id, body = {}) {
  const nId = assertPositiveInt(id, "id");
  if (!body || typeof body !== "object") throw badRequest("Body inválido");
  if (body.eventos != null && !Array.isArray(body.eventos))
    throw badRequest("Campo 'eventos' debe ser un arreglo");
  normalizeViaticos(body?.cotizacion);
  applyFechaEventoFromEventos(body?.cotizacion, body?.eventos);
  if (body?.cotizacion?.estado != null) {
    assertEstado(body.cotizacion.estado);
  }
  if (body?.cotizacion?.dias != null) {
    assertOptionalPositiveInt(body.cotizacion.dias, "cotizacion.dias");
  }
  if (body?.cotizacion?.viaticosMonto != null) {
    assertOptionalNonNegativeNumber(body.cotizacion.viaticosMonto, "cotizacion.viaticosMonto");
  }

  await rechazarVencidasLocal();
  const info = await repo.getFechaYEstado(nId);
  if (!info) { const err = new Error(`Cotización ${nId} no encontrada`); err.status = 404; throw err; }

  const fechaEvento = body?.cotizacion?.fechaEvento ?? info.fechaEvento;
  if (!isEditableFechaEvento(fechaEvento)) {
    throw badRequest("Cotización no editable el mismo día del evento.");
  }

  if (Array.isArray(body.items)) {
    await repo.replaceServiciosFechas(nId, []);
  }

  const updated = await repo.updateAdmin(nId, body);
  await applyServiciosFechas(nId, body);
  return updated;
}

async function remove(id) {
  const nId = assertPositiveInt(id, "id");
  return await repo.deleteById(nId);
}

async function cambiarEstadoOptimista(id, { estadoNuevo, estadoEsperado } = {}) {
  const nId = assertPositiveInt(id, "id");
  const nuevo = assertEstado(estadoNuevo);
  const esperado = estadoEsperado == null ? null : assertEstado(estadoEsperado);

  await rechazarVencidasLocal();
  const info = await repo.getFechaYEstado(nId);
  if (!info) { const err = new Error(`Cotización ${nId} no encontrada`); err.status = 404; throw err; }

  if (
    VALIDAR_BLOQUEO_EVENTO_VENCIDO &&
    nuevo !== "Rechazada" &&
    !isEditableFechaEvento(info.fechaEvento)
  ) {
    throw badRequest("Cotización vencida: solo se permite rechazar el mismo día del evento.");
  }
  if (
    VALIDAR_ACEPTACION_ANTES_EVENTO &&
    nuevo === "Aceptada" &&
    !isAceptableFechaEvento(info.fechaEvento)
  ) {
    throw badRequest("La cotización solo puede aceptarse hasta un día antes del evento.");
  }

  return await repo.cambiarEstado(nId, { estadoNuevo: nuevo, estadoEsperado: esperado });
}

function normalizeText(s) {
  return String(s || "").trim();
}

function classifyItem(it) {
  const exs = it?.eventoServicio;
  const servicioNombre = normalizeText(exs?.servicioNombre || it?.nombre).toLowerCase();

  // reglas fuertes por minutos
  const trailer = Number(it?.trailerMin ?? exs?.trailerMin ?? 0);
  const film = Number(it?.filmMin ?? exs?.filmMin ?? 0);
  if (trailer > 0 || film > 0) return "video";

  if (servicioNombre.includes("video") || servicioNombre.includes("film")) return "video";
  if (servicioNombre.includes("foto") || servicioNombre.includes("fotograf")) return "foto";

  // fallback
  return "foto";
}

  function collectEquiposNombres(arr = []) {
    const out = [];

    for (const it of arr) {
      const equipos = it?.eventoServicio?.equipos;
      if (!Array.isArray(equipos)) continue;

      for (const eq of equipos) {
        const nombre = normalizeText(eq?.tipoEquipo) || "Equipo";
        const cantidad = Number(eq?.cantidad ?? 0);

        // solo nombre + cantidad (ej: "Cámara x4")
        const text = cantidad > 0 ? `${nombre} x${cantidad}` : nombre;
        out.push(text);
      }
    }

    // dedupe manteniendo orden
    const uniq = [];
    const seen = new Set();
    for (const t of out) {
      const k = String(t || "").trim();
      if (!k || seen.has(k)) continue;
      seen.add(k);
      uniq.push(k);
    }

    return uniq.join(", ");
  }


function dedupeByKey(arr, keyFn) {
  const seen = new Set();
  const out = [];
  for (const x of arr) {
    const k = keyFn(x);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(x);
  }
  return out;
}

function mapSpJsonToTemplateData(detail) {
  const cot = detail?.cotizacion || {};
  const contacto = detail?.contacto || {};
  const items = Array.isArray(detail?.items) ? detail.items : [];
  const eventos = Array.isArray(detail?.eventos) ? detail.eventos : [];
  const serviciosFechas = Array.isArray(detail?.serviciosFechas) ? detail.serviciosFechas : [];

  // =========================
  // Helpers locales
  // =========================
  const normalize = (v) => normalizeText(v);

  const getItemId = (it) =>
    it?.idCotizacionServicio ??
    it?.idCotServ ??
    it?.PK_CotServ_Cod ??
    it?.PK_CotServCod ??
    null;

  const sumItemSubtotal = (it) => {
    const subtotal = Number(it?.subtotal);
    if (Number.isFinite(subtotal)) return subtotal;

    const qty = Number(it?.cantidad ?? 1);
    const pu = Number(it?.precioUnit ?? 0);
    if (Number.isFinite(qty) && Number.isFinite(pu)) return qty * pu;

    return 0;
  };

  const collectEquiposNombres = (arr) => {
    const map = new Map();

    for (const it of arr || []) {
      const equipos = it?.eventoServicio?.equipos;
      if (!Array.isArray(equipos)) continue;

      for (const eq of equipos) {
        const nombre = normalize(eq?.tipoEquipo) || "Equipo";
        const cant = Number(eq?.cantidad ?? 0);
        const key = nombre.toLowerCase();

        const prev = map.get(key) || { nombre, cantidad: 0 };
        prev.cantidad += Number.isFinite(cant) ? cant : 0;
        map.set(key, prev);
      }
    }

    return Array.from(map.values())
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
      .map((x) => (x.cantidad > 0 ? `${x.nombre} x${x.cantidad}` : x.nombre))
      .join(", ");
  };

  const collectPersonal = (arr) => {
    const out = [];
    for (const it of arr || []) {
      const staff = it?.eventoServicio?.staff;
      if (!Array.isArray(staff)) continue;

      for (const st of staff) {
        const rol = normalize(st?.rol) || "Staff";
        const cantidad = Number(st?.cantidad ?? 0);
        out.push({ nombre: cantidad ? `${cantidad} ${rol}` : rol });
      }
    }
    return dedupeByKey(out, (x) => x.nombre);
  };

  const buildLocaciones = (evs = []) => {
    const out = [];
    for (const e of evs || []) {
      const u = normalize(e?.ubicacion);
      const d = normalize(e?.direccion);
      const h = toHHmm(e?.hora);
      const parts = [u, d, h].filter(Boolean);
      if (!parts.length) continue;
      out.push({ nombre: parts.join(" - ") });
    }
    return dedupeByKey(out, (x) => x.nombre);
  };

  const toEntregable = (it) => {
    const nombre = normalize(it?.nombre) || "Servicio";
    const desc = normalize(it?.descripcion);
    return { descripcion: desc ? `${nombre} — ${desc}` : nombre };
  };

  const isDrone = (it) => {
    const name = normalize(it?.eventoServicio?.servicioNombre || it?.nombre).toLowerCase();
    return name.includes("dron") || name.includes("drone");
  };

  const isBooth = (it) => {
    const name = normalize(it?.eventoServicio?.servicioNombre || it?.nombre).toLowerCase();
    return (
      name.includes("photobooth") ||
      name.includes("photo booth") ||
      name.includes("cabina") ||
      name.includes("totem") ||
      name.includes("tótem")
    );
  };

  // ✅ Listar fechas bonito en una sola línea:
  // - mismo mes/año: "28, 29 y 31 de Enero de 2026"
  // - meses distintos: "28 y 31 de Enero de 2026; 2 de Febrero de 2026"
  const fechasInline = (dates = []) => {
    const ds = (dates || []).filter(Boolean);

    const parseISO = (s) => {
      const m = String(s).trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!m) return null;
      const y = Number(m[1]);
      const mo = Number(m[2]);
      const d = Number(m[3]);
      if (!y || !mo || !d) return null;
      return { y, mo, d };
    };

    const monthName = (mo) =>
      new Intl.DateTimeFormat("es-PE", { month: "long" }).format(new Date(2026, mo - 1, 1));

    const joinDays = (days) => {
      const arr = [...days].sort((a, b) => a - b);
      if (arr.length === 1) return String(arr[0]);
      if (arr.length === 2) return `${arr[0]} y ${arr[1]}`;
      return `${arr.slice(0, -1).join(", ")} y ${arr[arr.length - 1]}`;
    };

    const groups = new Map(); // "YYYY-MM" -> {y, mo, days:Set}
    for (const raw of ds) {
      const p = parseISO(raw);
      if (!p) continue;
      const key = `${p.y}-${String(p.mo).padStart(2, "0")}`;
      if (!groups.has(key)) groups.set(key, { y: p.y, mo: p.mo, days: new Set() });
      groups.get(key).days.add(p.d);
    }

    const sortedGroups = Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, g]) => g);

    if (sortedGroups.length === 0) return ds.join(", ");

    const parts = sortedGroups.map((g) => {
      const daysStr = joinDays(g.days);
      const mes = monthName(g.mo);
      const mesCap = mes.charAt(0).toUpperCase() + mes.slice(1);
      return `${daysStr} de ${mesCap} de ${g.y}`;
    });

    return parts.join("; ");
  };

  // =========================
  // 1) CLASIFICAR ITEMS (foto/video/drone/booth)
  // =========================
  const fotoItems = [];
  const videoItems = [];
  const droneItems = [];
  const boothItems = [];

  for (const it of items) {
    if (isDrone(it)) {
      droneItems.push(it);
      continue;
    }
    if (isBooth(it)) {
      boothItems.push(it);
      continue;
    }

    const kind = classifyItem(it);
    if (kind === "video") videoItems.push(it);
    else fotoItems.push(it);
  }

  const hasFoto = fotoItems.length > 0;
  const hasVideo = videoItems.length > 0;
  const hasDrone = droneItems.length > 0;
  const hasBooth = boothItems.length > 0;

  // =========================
  // 2) CABECERA (texto general)
  // =========================
  const partsMain = [];
  if (hasFoto) partsMain.push("fotografía");
  if (hasVideo) partsMain.push("video");

  const partsExtra = [];
  if (hasDrone) partsExtra.push("drones");
  if (hasBooth) partsExtra.push("photobooth");

  let servicioTexto = "servicios";
  if (partsMain.length && partsExtra.length) {
    servicioTexto = `${partsMain.join(" y ")} (incluye ${partsExtra.join(" y ")})`;
  } else if (partsMain.length) {
    servicioTexto = partsMain.join(" y ");
  } else if (partsExtra.length) {
    servicioTexto = partsExtra.join(" y ");
  }

  const tipoDoc = String(contacto?.tipoDocumento || "").toUpperCase();
  const esRuc = tipoDoc === "RUC";

  let tituloCotizacion = "Cotización";
  if (hasFoto && hasVideo) tituloCotizacion = "Cotización para tomas fotográficas y video";
  else if (hasFoto) tituloCotizacion = "Cotización para tomas fotográficas";
  else if (hasVideo) tituloCotizacion = "Cotización para tomas de video";
  else if (hasDrone && !hasBooth) tituloCotizacion = "Cotización para servicio de drones";
  else if (!hasDrone && hasBooth) tituloCotizacion = "Cotización para servicio de photobooth";
  else if (hasDrone && hasBooth) tituloCotizacion = "Cotización para drones y photobooth";

  const clienteEmpresa = esRuc ? normalize(contacto?.razonSocial) || "" : "";
  const clienteContacto = esRuc
    ? normalize(contacto?.nombreContacto) || normalize(contacto?.nombre) || "Cliente"
    : normalize(contacto?.nombre) || "Cliente";

  const eventoNombre = normalize(cot?.tipoEvento) || "Evento";

  // =========================
  // 3) MAPA itemId -> fechas asignadas (serviciosFechas)
  // =========================
  const itemDatesMap = new Map(); // id -> Set(fecha)
  for (const sf of serviciosFechas) {
    const id = Number(sf?.idCotizacionServicio ?? sf?.FK_CotServ_Cod ?? 0);
    const fecha = normalize(sf?.fecha ?? sf?.CSF_Fecha);
    if (!id || !fecha) continue;
    if (!itemDatesMap.has(id)) itemDatesMap.set(id, new Set());
    itemDatesMap.get(id).add(fecha);
  }

  // ✅ Fechas únicas del evento (ordenadas)
  const allDates = Array.from(
    new Set(
      eventos
        .map((e) => normalize(e?.fecha))
        .filter(Boolean)
        .sort()
    )
  );

  // fallback si no hay eventos
  const fechaPrincipal = normalize(cot?.fechaEvento || "");
  if (allDates.length === 0 && fechaPrincipal) allDates.push(fechaPrincipal);

  const getDatesForItem = (it) => {
    const id = Number(getItemId(it) ?? 0);
    const set = itemDatesMap.get(id);
    if (set && set.size) return Array.from(set).sort();
    return allDates; // si no está asignado => todos los días
  };

  const itemHappensOn = (it, fecha) => getDatesForItem(it).includes(fecha);

  // ✅ Header inline con días/mes/año
  const eventoFechaRango = fechasInline(allDates);

  // =========================
  // 4) Construir DÍAS => {#dias}{#servicios}
  //    ✅ Locaciones solo 1 vez por día
  // =========================
  const dias = [];

  for (const fecha of allDates) {
    const eventosDia = eventos.filter((e) => normalize(e?.fecha) === fecha);
    const locacionesDia = buildLocaciones(eventosDia.length ? eventosDia : eventos);

    const fotoDia = fotoItems.filter((it) => itemHappensOn(it, fecha));
    const videoDia = videoItems.filter((it) => itemHappensOn(it, fecha));
    const droneDia = droneItems.filter((it) => itemHappensOn(it, fecha));
    const boothDia = boothItems.filter((it) => itemHappensOn(it, fecha));

    const hasMainDia = fotoDia.length > 0 || videoDia.length > 0;

    const servicios = [];
    let n = 1;

  const pushServicio = (key, arr) => {
    if (!arr.length) return;

    let titulo = "";
    if (key === "foto") titulo = `${n++}) Fotografía`;
    else if (key === "video") titulo = `${n++}) Video`;
    else if (key === "drone") titulo = hasMainDia ? "Extra: Drones" : `${n++}) Drones`;
    else if (key === "booth") titulo = hasMainDia ? "Extra: Photobooth" : `${n++}) Photobooth`;
    else titulo = `${n++}) Servicio`;

    // ✅ En vez de objeto/loop (que deja párrafo vacío cuando no aplica),
    // mandamos una línea lista (o vacío), con salto \n dentro del MISMO párrafo.
    let cantidadFotosLinea = "";
    if (key === "foto") {
      const maxFotos = arr.reduce((max, it) => {
        const val = Number(
          it?.fotosImpresas ??
            it?.eventoServicio?.fotosImpresas ??
            it?.eventoServicio?.ExS_FotosImpresas ??
            0
        );
        return Number.isFinite(val) ? Math.max(max, val) : max;
      }, 0);

      if (maxFotos > 0) {
        cantidadFotosLinea = `• Cantidad de fotos: ${maxFotos}\n`;
      }
    }

    const subtotalProrrateado = arr.reduce((acc, it) => {
      const subtotal = sumItemSubtotal(it);
      const ds = getDatesForItem(it);
      const k = ds.length || 1;
      return acc + subtotal / k;
    }, 0);

    servicios.push({
      titulo,
      equiposTexto: collectEquiposNombres(arr),
      personal: collectPersonal(arr),
      // ✅ ya NO locaciones aquí (se muestran 1 vez por día)
      cantidadFotosLinea,
      entregables: arr.map(toEntregable),
      _subtotalNum: subtotalProrrateado,
    });
  };


    pushServicio("foto", fotoDia);
    pushServicio("video", videoDia);
    pushServicio("drone", droneDia);
    pushServicio("booth", boothDia);

    if (!servicios.length) continue;

    const subtotalDiaNum = servicios.reduce((acc, s) => acc + (Number(s._subtotalNum) || 0), 0);
    for (const s of servicios) delete s._subtotalNum;

    const fechaDMY = formatDateDMY(fecha);

    dias.push({
      diaNumero: dias.length + 1,
      fecha: fechaDMY,
      locacionesDia,
      servicios,
      subtotalDia: subtotalDiaNum.toFixed(2),
      _subtotalDiaNum: subtotalDiaNum,
    });
  }

  // =========================
  // 5) VIÁTICOS (opción A)
  // =========================
  const lugar = normalize(cot?.lugar || "");
  const esLima = lugar.toLowerCase() === "lima";

  const viaticosMontoNum = Number(cot?.viaticosMonto ?? 0);
  const viaticosMontoOk = Number.isFinite(viaticosMontoNum) ? viaticosMontoNum : 0;

  const viaticosClienteCubre =
    Boolean(cot?.viaticosClienteCubre) || (!esLima && viaticosMontoOk <= 0);

  const mostrarViaticos = !esLima;

  const viaticosTexto = viaticosClienteCubre
    ? "Los boletos aéreos, viáticos y hospedaje serán cubiertos por el cliente."
    : "Los boletos aéreos, viáticos y hospedaje están incluidos en el presupuesto.";

  const mostrarViaticosMonto = !esLima && !viaticosClienteCubre && viaticosMontoOk > 0;

  // =========================
  // 6) TOTALES (resumen final)
  // =========================
  const totalServicios = items.reduce((acc, it) => acc + sumItemSubtotal(it), 0);

  const subtotalServiciosDiasNum = dias.reduce(
    (acc, d) => acc + (Number(d._subtotalDiaNum) || 0),
    0
  );
  const subtotalServiciosDias = subtotalServiciosDiasNum.toFixed(2);

  const montoTotalFinal = totalServicios + (mostrarViaticosMonto ? viaticosMontoOk : 0);

  for (const d of dias) delete d._subtotalDiaNum;

  return {
    tituloCotizacion,
    mostrarSres: esRuc,
    clienteEmpresa,
    clienteContacto,

    servicioTexto,
    eventoNombre,
    eventoFechaRango,

    dias,
    subtotalServiciosDias,

    mostrarViaticos,
    viaticosTexto,
    mostrarViaticosMonto,
    viaticosMonto: viaticosMontoOk.toFixed(2),
    montoTotal: montoTotalFinal.toFixed(2),

    fechaEmisionLarga: cot?.fechaCreacion
      ? formatDateLong(cot.fechaCreacion)
      : formatDateLong(new Date()),
  };
}




module.exports = {
  list,
  findById,
  streamPdf,
  migrarAPedido,
  createPublic,
  createAdmin,
  update,
  remove,
  cambiarEstadoOptimista,
};
