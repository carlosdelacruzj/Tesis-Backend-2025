// src/modules/inventario/tipo-equipo/tipo-equipo.service.js
const repo = require("./tipo-equipo.repository");
const { ensurePositiveInt, ensureTrimmedString } = require("../shared/validation");

function rethrowRepositoryError(err) {
  if (err && err.code === "ER_DUP_ENTRY") {
    const custom = new Error("El tipo de equipo ya existe.");
    custom.status = 409;
    throw custom;
  }
  throw err;
}

async function list() {
  return repo.findAll();
}

async function findById(idTipoEquipo) {
  const id = ensurePositiveInt(idTipoEquipo, "idTipoEquipo");
  const tipo = await repo.findById(id);
  if (!tipo) {
    const err = new Error("El tipo de equipo solicitado no existe.");
    err.status = 404;
    throw err;
  }
  return tipo;
}

async function create(payload) {
  const nombre = ensureTrimmedString(payload?.nombre, "nombre", { maxLength: 60 });
  try {
    return await repo.create({ nombre });
  } catch (err) {
    rethrowRepositoryError(err);
  }
}

async function update(idTipoEquipo, payload) {
  const id = ensurePositiveInt(idTipoEquipo, "idTipoEquipo");
  const nombre = ensureTrimmedString(payload?.nombre, "nombre", { maxLength: 60 });
  try {
    const tipo = await repo.update(id, { nombre });
    if (!tipo) {
      const err = new Error("El tipo de equipo solicitado no existe.");
      err.status = 404;
      throw err;
    }
    return tipo;
  } catch (err) {
    rethrowRepositoryError(err);
  }
}

async function remove(idTipoEquipo) {
  const id = ensurePositiveInt(idTipoEquipo, "idTipoEquipo");
  const deleted = await repo.remove(id);
  if (!deleted) {
    const err = new Error("El tipo de equipo solicitado no existe.");
    err.status = 404;
    throw err;
  }
}

module.exports = {
  list,
  findById,
  create,
  update,
  remove,
};
