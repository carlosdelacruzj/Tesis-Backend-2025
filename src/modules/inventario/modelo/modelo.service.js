// src/modules/inventario/modelo/modelo.service.js
const repo = require("./modelo.repository");
const { ensurePositiveInt, ensureTrimmedString } = require("../shared/validation");

function handleRepositoryError(err) {
  if (!err) {
    return;
  }
  if (err.code === "ER_DUP_ENTRY") {
    const custom = new Error("Ya existe un modelo con ese nombre para la marca seleccionada.");
    custom.status = 409;
    throw custom;
  }
  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    const custom = new Error("La marca o el tipo de equipo indicado no existe.");
    custom.status = 400;
    throw custom;
  }
  if (err.code === "ER_ROW_IS_REFERENCED_2") {
    const custom = new Error("No se puede eliminar el modelo porque esta en uso.");
    custom.status = 409;
    throw custom;
  }
  throw err;
}

async function list() {
  return repo.findAll();
}

async function findById(idModelo) {
  const id = ensurePositiveInt(idModelo, "idModelo");
  const modelo = await repo.findById(id);
  if (!modelo) {
    const err = new Error("El modelo solicitado no existe.");
    err.status = 404;
    throw err;
  }
  return modelo;
}

async function create(payload) {
  const nombre = ensureTrimmedString(payload?.nombre, "nombre", { maxLength: 100 });
  const idMarca = ensurePositiveInt(payload?.idMarca, "idMarca");
  const idTipoEquipo = ensurePositiveInt(payload?.idTipoEquipo, "idTipoEquipo");
  try {
    return await repo.create({ nombre, idMarca, idTipoEquipo });
  } catch (err) {
    handleRepositoryError(err);
  }
}

async function update(idModelo, payload) {
  const id = ensurePositiveInt(idModelo, "idModelo");
  const nombre = ensureTrimmedString(payload?.nombre, "nombre", { maxLength: 100 });
  const idMarca = ensurePositiveInt(payload?.idMarca, "idMarca");
  const idTipoEquipo = ensurePositiveInt(payload?.idTipoEquipo, "idTipoEquipo");
  try {
    const modelo = await repo.update(id, { nombre, idMarca, idTipoEquipo });
    if (!modelo) {
      const err = new Error("El modelo solicitado no existe.");
      err.status = 404;
      throw err;
    }
    return modelo;
  } catch (err) {
    handleRepositoryError(err);
  }
}

async function remove(idModelo) {
  const id = ensurePositiveInt(idModelo, "idModelo");
  try {
    const deleted = await repo.remove(id);
    if (!deleted) {
      const err = new Error("El modelo solicitado no existe.");
      err.status = 404;
      throw err;
    }
  } catch (err) {
    handleRepositoryError(err);
  }
}

module.exports = {
  list,
  findById,
  create,
  update,
  remove,
};
