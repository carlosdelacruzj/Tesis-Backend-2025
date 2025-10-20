const repo = require("./lead.repository");

function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

function assertPositiveInt(value, field) {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) {
    throw badRequest(`${field} invalido`);
  }
  return num;
}

function assertNonEmptyString(value, field) {
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

async function convertirACliente(leadId, payload = {}) {
  if (payload == null || typeof payload !== "object") {
    throw badRequest("Body invalido");
  }

  const id = assertPositiveInt(leadId, "leadId");
  const correo = assertNonEmptyString(payload.correo, "correo");

  const result = await repo.convertirACliente({
    leadId: id,
    correo,
    celular: cleanString(payload.celular),
    nombre: cleanString(payload.nombre),
    apellido: cleanString(payload.apellido),
    numDoc: cleanString(payload.numDoc),
    direccion: cleanString(payload.direccion),
    tipoCliente: 1,
    estadoCliente: 1,
  });

  return result;
}

module.exports = {
  convertirACliente,
};
