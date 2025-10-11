// cotizacion.service.js
const repo = require("./cotizacion.repository");

const ESTADOS_VALIDOS = new Set([
  "Borrador",
  "Enviada",
  "Aceptada",
  "Rechazada",
]);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

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

module.exports = {
  list,
  findById,
  createPublic,
  createAdmin,
  update,
  remove,
};
