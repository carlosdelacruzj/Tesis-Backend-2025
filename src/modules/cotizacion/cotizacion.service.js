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

const fs = require("fs");

// â”€â”€â”€â”€â”€â”€â”€â”€â”€ utils â”€â”€â”€â”€â”€â”€â”€â”€â”€
function badRequest(message){ const err=new Error(message); err.status=400; return err; }
function assertPositiveInt(v,f){ const n=Number(v); if(!Number.isInteger(n)||n<=0) throw badRequest(`${f} invÃ¡lido`); return n; }
function assertOptionalPositiveInt(v,f){ if(v==null) return null; return assertPositiveInt(v,f); }
function assertString(v,f){ if(typeof v!=="string"||!v.trim()) throw badRequest(`Campo '${f}' es requerido`); return v.trim(); }
function assertDate(v,f){ if(v==null) return null; if(typeof v!=="string"||!ISO_DATE.test(v)) throw badRequest(`Campo '${f}' debe ser YYYY-MM-DD`); return v; }
function assertEstado(v){ if(v==null) return "Borrador"; const e=String(v).trim(); if(!ESTADOS_VALIDOS.has(e)) throw badRequest(`estado invÃ¡lido. Valores permitidos: ${[...ESTADOS_VALIDOS].join(", ")}`); return e; }


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
  const date = parseLocalDate(value);
  if (!date) return String(value);
  const parts = new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).formatToParts(date);
  const day = parts.find((p) => p.type === "day")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const year = parts.find((p) => p.type === "year")?.value;
  if (!day || !month || !year) {
    return new Intl.DateTimeFormat("es-PE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  }
  const prettyMonth = month.charAt(0).toUpperCase() + month.slice(1);
  return `${prettyMonth} ${day}, ${year}`;
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

  // ✅ Mapeo desde tu JSON real (usa servicioNombre / filmMin / trailerMin)
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
  // Validaciones mÃ­nimas (el SP tambiÃ©n valida)
  assertString(lead?.nombre ?? "", "lead.nombre");
  assertString(cotizacion?.tipoEvento ?? "", "cotizacion.tipoEvento");
  assertDate(cotizacion?.fechaEvento, "cotizacion.fechaEvento");
  if (cotizacion?.dias != null) assertOptionalPositiveInt(cotizacion.dias, "cotizacion.dias");
  return await repo.createPublic({ lead, cotizacion });
}

async function createAdmin(payload = {}) {
  if (!payload || typeof payload !== "object") throw badRequest("Body invÃ¡lido");
  if (payload.eventos != null && !Array.isArray(payload.eventos))
    throw badRequest("Campo 'eventos' debe ser un arreglo");
  if (payload?.cotizacion?.estado != null) {
    assertEstado(payload.cotizacion.estado);
  }
  if (payload?.cotizacion?.dias != null) {
    assertOptionalPositiveInt(payload.cotizacion.dias, "cotizacion.dias");
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
  if (body?.cotizacion?.estado != null) {
    assertEstado(body.cotizacion.estado);
  }
  if (body?.cotizacion?.dias != null) {
    assertOptionalPositiveInt(body.cotizacion.dias, "cotizacion.dias");
  }

  await rechazarVencidasLocal();
  const info = await repo.getFechaYEstado(nId);
  if (!info) { const err = new Error(`Cotización ${nId} no encontrada`); err.status = 404; throw err; }

  const fechaEvento = body?.cotizacion?.fechaEvento ?? info.fechaEvento;
  if (!isEditableFechaEvento(fechaEvento)) {
    throw badRequest("Cotización no editable el mismo día del evento.");
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

  if (nuevo !== "Rechazada" && !isEditableFechaEvento(info.fechaEvento)) {
    throw badRequest("Cotización vencida: solo se permite rechazar el mismo día del evento.");
  }
  if (nuevo === "Aceptada" && !isAceptableFechaEvento(info.fechaEvento)) {
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

  // ===== separar items (PRIMERO) =====
  const fotoItems = [];
  const videoItems = [];

  for (const it of items) {
    const kind = classifyItem(it);
    if (kind === "video") videoItems.push(it);
    else fotoItems.push(it);
  }

  const hasFoto = fotoItems.length > 0;
  const hasVideo = videoItems.length > 0;

  // ===== Texto “fotografía / video” =====
  let servicioTexto = "fotografía";
  if (hasFoto && hasVideo) servicioTexto = "fotografía y video";
  else if (!hasFoto && hasVideo) servicioTexto = "video";

  // ===== RUC => mostrar Sres. + razón social =====
  const tipoDoc = String(contacto?.tipoDocumento || "").toUpperCase();
  const esRuc = tipoDoc === "RUC";

  // ===== títulos dinámicos (si los usas en el DOCX) =====
  let tituloCotizacion = "Cotización";
  let textoServicioCotizacion = "fotografía y video";

  if (hasFoto && hasVideo) {
    tituloCotizacion = "Cotización para tomas fotográficas y video";
    textoServicioCotizacion = "fotografía y video";
  } else if (hasFoto) {
    tituloCotizacion = "Cotización para tomas fotográficas";
    textoServicioCotizacion = "fotografía";
  } else if (hasVideo) {
    tituloCotizacion = "Cotización para tomas de video";
    textoServicioCotizacion = "video";
  }

  const sumImporte = (arr) =>
    arr.reduce((acc, it) => {
      const subtotal = Number(it?.subtotal);
      if (Number.isFinite(subtotal)) return acc + subtotal;

      const qty = Number(it?.cantidad ?? 1);
      const pu = Number(it?.precioUnit ?? 0);
      return Number.isFinite(qty) && Number.isFinite(pu) ? acc + qty * pu : acc;
    }, 0);

  // ===== Equipos y personal =====
  const collectEquipos = (arr) => {
    const out = [];
    for (const it of arr) {
      const equipos = it?.eventoServicio?.equipos;
      if (!Array.isArray(equipos)) continue;

      for (const eq of equipos) {
        const nombre = normalizeText(eq?.tipoEquipo) || "Equipo";
        const cantidad = Number(eq?.cantidad ?? 0);
        const notas = normalizeText(eq?.notas);
        const detalle = `${cantidad ? "x" + cantidad : ""}${notas ? " — " + notas : ""}`.trim();
        out.push({ nombre, detalle });
      }
    }
    return dedupeByKey(out, (x) => `${x.nombre}|${x.detalle}`);
  };

  const collectPersonal = (arr) => {
    const out = [];
    for (const it of arr) {
      const staff = it?.eventoServicio?.staff;
      if (!Array.isArray(staff)) continue;

      for (const st of staff) {
        const rol = normalizeText(st?.rol) || "Staff";
        const cantidad = Number(st?.cantidad ?? 0);
        out.push({
          nombre: cantidad ? `${cantidad} ${rol}` : rol,
          rol: "Personal",
        });
      }
    }
    return dedupeByKey(out, (x) => `${x.nombre}|${x.rol}`);
  };

  // ===== Locaciones =====
  const locs = eventos.map((e) => normalizeText(e?.ubicacion)).filter(Boolean);
  const fotoLocaciones = dedupeByKey(locs, (x) => x).map((nombre) => ({ nombre }));
  const videoLocaciones = fotoLocaciones;

  // ===== Entregables =====
  const toEntregable = (it) => {
    const nombre = normalizeText(it?.nombre) || "Servicio";
    const desc = normalizeText(it?.descripcion);
    return { descripcion: desc ? `${nombre} — ${desc}` : nombre };
  };

  const fotoEntregables = fotoItems.map(toEntregable);
  const videoEntregables = videoItems.map(toEntregable);

  // ===== Fechas =====
  const fechaPrincipal = cot?.fechaEvento || (eventos[0]?.fecha ?? "");
  const eventoFechaRango = normalizeText(fechaPrincipal);

  // ===== ClienteEmpresa / ClienteContacto =====
  const clienteEmpresa = esRuc ? (normalizeText(contacto?.razonSocial) || "") : "";

  const clienteContacto = esRuc
    ? (normalizeText(contacto?.nombreContacto) || normalizeText(contacto?.nombre) || "Cliente")
    : (normalizeText(contacto?.nombre) || "Cliente");

  return {
    // (si los usas en el Word)
    tituloCotizacion,
    textoServicioCotizacion,

    // ✅ esta es la que vas a poner en la frase:
    servicioTexto,

    // ✅ para el bloque {#mostrarSres}
    mostrarSres: esRuc,
    clienteEmpresa,
    clienteContacto,

    eventoNombre: normalizeText(cot?.tipoEvento) || "Evento",
    eventoFechaRango,

    // (por si luego quieres ocultar secciones)
    mostrarFoto: hasFoto,
    mostrarVideo: hasVideo,

    // Foto
    fotoEquipos: collectEquipos(fotoItems),
    fotoPersonal: collectPersonal(fotoItems),
    fotoLocaciones,
    fotoEntregables,
    fotoCantidadFotos: "",
    fotoFecha: eventoFechaRango,
    fotoLugar: normalizeText(cot?.lugar) || normalizeText(eventos[0]?.ubicacion) || "",
    fotoHorario: normalizeText(eventos[0]?.hora) || "",

    // Video
    videoEquipos: collectEquipos(videoItems),
    videoPersonal: collectPersonal(videoItems),
    videoLocaciones,
    videoEntregables,
    videoNotas: "",

    // Totales
    totalFoto: sumImporte(fotoItems).toFixed(2),
    totalVideo: sumImporte(videoItems).toFixed(2),

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







