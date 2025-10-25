// src/modules/inventario/marca/marca.service.js
const repo = require("./marca.repository");
const { ensurePositiveInt, ensureTrimmedString } = require("../shared/validation");

// Traduce errores de MySQL a codigos HTTP mas adecuados.
function rethrowRepositoryError(err) {
  if (err && err.code === "ER_DUP_ENTRY") {
    const custom = new Error("La marca ya existe.");
    custom.status = 409;
    throw custom;
  }
  throw err;
}

async function list() {
  return repo.findAll();
}

async function findById(idMarca) {
  const id = ensurePositiveInt(idMarca, "idMarca");
  const marca = await repo.findById(id);
  if (!marca) {
    const err = new Error("La marca solicitada no existe.");
    err.status = 404;
    throw err;
  }
  return marca;
}

async function create(payload) {
  const nombre = ensureTrimmedString(payload?.nombre, "nombre", { maxLength: 100 });
  try {
    return await repo.create({ nombre });
  } catch (err) {
    rethrowRepositoryError(err);
  }
}

async function update(idMarca, payload) {
  const id = ensurePositiveInt(idMarca, "idMarca");
  const nombre = ensureTrimmedString(payload?.nombre, "nombre", { maxLength: 100 });
  try {
    const marca = await repo.update(id, { nombre });
    if (!marca) {
      const err = new Error("La marca solicitada no existe.");
      err.status = 404;
      throw err;
    }
    return marca;
  } catch (err) {
    rethrowRepositoryError(err);
  }
}

async function remove(idMarca) {
  const id = ensurePositiveInt(idMarca, "idMarca");
  const deleted = await repo.remove(id);
  if (!deleted) {
    const err = new Error("La marca solicitada no existe.");
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
