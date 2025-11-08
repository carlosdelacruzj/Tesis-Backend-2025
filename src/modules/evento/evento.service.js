// src/modules/evento/evento.service.js
const repo = require("./evento.repository");

function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  throw err;
}

function assertPositiveInt(value, field) {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) {
    badRequest(`${field} invalido`);
  }
}

function toNullableString(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function mapEvento(row = {}) {
  return {
    id: row.id ?? row.PK_E_Cod ?? null,
    nombre: row.nombre ?? row.E_Nombre ?? null,
    iconUrl: row.iconUrl ?? row.E_IconUrl ?? null,
  };
}

async function findAll() {
  const rows = await repo.getAll();
  if (!Array.isArray(rows)) return [];
  return rows.map(mapEvento);
}

async function findById(id) {
  assertPositiveInt(id, "id");
  const row = await repo.getById(Number(id));
  if (!row) {
    const err = new Error(`Evento con id ${id} no encontrado`);
    err.status = 404;
    throw err;
  }
  return mapEvento(row);
}

async function create(payload = {}) {
  const nombreRaw = typeof payload.nombre === "string" ? payload.nombre : "";
  const nombre = nombreRaw.trim();
  if (!nombre) {
    badRequest("nombre es requerido");
  }
  const iconUrl = toNullableString(payload.iconUrl);

  await repo.create({ nombre, iconUrl });
  return { Status: "Registro exitoso" };
}

async function update(id, payload = {}) {
  assertPositiveInt(id, "id");

  const nombre =
    payload.nombre !== undefined
      ? toNullableString(payload.nombre)
      : undefined;
  const iconUrl =
    payload.iconUrl !== undefined
      ? toNullableString(payload.iconUrl)
      : undefined;

  if (nombre === undefined && iconUrl === undefined) {
    badRequest("Debe enviar al menos un campo para actualizar");
  }

  const result = await repo.updateById({
    idEvento: Number(id),
    nombre,
    iconUrl,
  });

  if (!result || result.affectedRows === 0) {
    const err = new Error(`Evento con id ${id} no encontrado`);
    err.status = 404;
    throw err;
  }

  return { Status: "Actualizacion exitosa" };
}

module.exports = { findAll, findById, create, update };
