const repo = require("./cotizacion.repository");

const ESTADOS_VALIDOS = new Set(["Borrador", "Enviada", "Aceptada", "Rechazada"]);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

function assertPositiveInt(value, field) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw badRequest(`${field} inv�lido`);
  }
  return n;
}

function assertString(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    throw badRequest(`Campo '${field}' es requerido`);
  }
  return value.trim();
}

function cleanString(value) {
  if (value == null) return null;
  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
}

function assertDate(value, field) {
  if (value == null) return null;
  if (typeof value !== "string" || !ISO_DATE.test(value)) {
    throw badRequest(`Campo '${field}' debe ser YYYY-MM-DD`);
  }
  return value;
}

function assertHoras(value) {
  if (value == null) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) {
    throw badRequest("horasEstimadas debe ser num�rico positivo");
  }
  return Number(n.toFixed(1));
}

function assertEstado(value) {
  if (value == null) return "Borrador";
  const estado = String(value).trim();
  if (!ESTADOS_VALIDOS.has(estado)) {
    throw badRequest(`estado inv�lido. Valores permitidos: ${[...ESTADOS_VALIDOS].join(", ")}`);
  }
  return estado;
}

function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    estado: row.estado,
    fechaCreacion: row.fechaCreacion,
    tipoEvento: row.tipoEvento,
    fechaEvento: row.fechaEvento,
    lugar: row.lugar,
    horasEstimadas: row.horasEstimadas,
    mensaje: row.mensaje,
    lead: {
      id: row.leadId,
      nombre: row.leadNombre,
      celular: row.leadCelular,
      origen: row.leadOrigen,
      fechaCreacion: row.leadFechaCreacion,
    },
  };
}

async function list({ estado } = {}) {
  const filtroEstado = estado ? assertEstado(estado) : undefined;
  const rows = await repo.listAll({ estado: filtroEstado });
  return rows.map(mapRow);
}

async function findById(id) {
  const n = assertPositiveInt(id, "id");
  const row = await repo.findById(n);
  if (!row) {
    const err = new Error(`Cotizaci�n ${n} no encontrada`);
    err.status = 404;
    throw err;
  }
  return mapRow(row);
}

async function create(payload = {}) {
  const leadPayload = payload.lead || {};
  const cotPayload = payload.cotizacion || {};

  const nombre = assertString(leadPayload.nombre, "lead.nombre");
  const celular = cleanString(leadPayload.celular);
  const origen = cleanString(leadPayload.origen);

  const tipoEvento = assertString(cotPayload.tipoEvento, "cotizacion.tipoEvento");
  const fechaEvento = assertDate(cotPayload.fechaEvento, "cotizacion.fechaEvento");
  const lugar = cleanString(cotPayload.lugar);
  const horasEstimadas = assertHoras(cotPayload.horasEstimadas);
  const mensaje = cleanString(cotPayload.mensaje);
  const estado = assertEstado(cotPayload.estado);

  const result = await repo.create({
    lead: { nombre, celular, origen },
    cotizacion: {
      tipoEvento,
      fechaEvento,
      lugar,
      horasEstimadas,
      mensaje,
      estado,
    },
  });

  return {
    Status: "Registro exitoso",
    leadId: result.leadId,
    cotizacionId: result.cotizacionId,
  };
}

async function update(id, payload = {}) {
  const cotizacionId = assertPositiveInt(id, "id");
  if (!payload.lead && !payload.cotizacion) {
    throw badRequest("Debe enviar lead y/o cotizacion para actualizar");
  }

  const row = await repo.findById(cotizacionId);
  if (!row) {
    const err = new Error(`Cotizaci�n ${cotizacionId} no encontrada`);
    err.status = 404;
    throw err;
  }

  if (payload.lead) {
    const updates = {};
    if (Object.prototype.hasOwnProperty.call(payload.lead, "nombre")) {
      updates.nombre = assertString(payload.lead.nombre, "lead.nombre");
    }
    if (Object.prototype.hasOwnProperty.call(payload.lead, "celular")) {
      updates.celular = cleanString(payload.lead.celular);
    }
    if (Object.prototype.hasOwnProperty.call(payload.lead, "origen")) {
      updates.origen = cleanString(payload.lead.origen);
    }
    await repo.updateLead(row.leadId, updates);
  }

  if (payload.cotizacion) {
    const updates = {};
    if (Object.prototype.hasOwnProperty.call(payload.cotizacion, "tipoEvento")) {
      updates.tipoEvento = assertString(payload.cotizacion.tipoEvento, "cotizacion.tipoEvento");
    }
    if (Object.prototype.hasOwnProperty.call(payload.cotizacion, "fechaEvento")) {
      updates.fechaEvento = assertDate(payload.cotizacion.fechaEvento, "cotizacion.fechaEvento");
    }
    if (Object.prototype.hasOwnProperty.call(payload.cotizacion, "lugar")) {
      updates.lugar = cleanString(payload.cotizacion.lugar);
    }
    if (Object.prototype.hasOwnProperty.call(payload.cotizacion, "horasEstimadas")) {
      updates.horasEstimadas = assertHoras(payload.cotizacion.horasEstimadas);
    }
    if (Object.prototype.hasOwnProperty.call(payload.cotizacion, "mensaje")) {
      updates.mensaje = cleanString(payload.cotizacion.mensaje);
    }
    if (Object.prototype.hasOwnProperty.call(payload.cotizacion, "estado")) {
      updates.estado = assertEstado(payload.cotizacion.estado);
    }
    await repo.updateCotizacion(cotizacionId, updates);
  }

  return { Status: "Actualizaci�n exitosa" };
}

async function remove(id) {
  const cotizacionId = assertPositiveInt(id, "id");
  const result = await repo.deleteById(cotizacionId);
  if (!result.deleted) {
    const err = new Error(`Cotizaci�n ${cotizacionId} no encontrada`);
    err.status = 404;
    throw err;
  }
  return {
    Status: "Eliminaci�n exitosa",
    leadEliminado: result.leadDeleted,
  };
}

module.exports = {
  list,
  findById,
  create,
  update,
  remove,
};
