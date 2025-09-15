// src/modules/equipo/equipo.service.js
const repo = require("./equipo.repository");

function assertString(v, field) {
  if (typeof v !== "string" || !v.trim()) {
    const err = new Error(`Campo '${field}' es requerido`);
    err.status = 400;
    throw err;
  }
}

function assertInt(v, field) {
  const num = Number(v);
  if (!Number.isFinite(num) || num <= 0) {
    const err = new Error(`Campo '${field}' debe ser un entero válido`);
    err.status = 400;
    throw err;
  }
  return num;
}

async function list() {
  return repo.getAll();
}

async function findByTipo(idTipoEquipo) {
  const id = assertInt(idTipoEquipo, "idTipoEquipo");
  return repo.getByTipoEquipo(id);
}

async function findByGroup({ tipoEquipo, marca, modelo }) {
  const idTipo = assertInt(tipoEquipo, "tipoEquipo");
  const idMarca = assertInt(marca, "marca");
  const idModelo = assertInt(modelo, "modelo");
  return repo.getByGroup({ tipoEquipo: idTipo, marca: idMarca, modelo: idModelo });
}

async function listGroup() {
  return repo.getAllGroup();
}

async function listMarca() {
  return repo.getAllMarca();
}

async function listModelo({ marca, tipo }) {
  const idMarca = assertInt(marca, "marca");
  const idTipo = assertInt(tipo, "tipo");
  return repo.getAllModelo({ marca: idMarca, tipo: idTipo });
}

async function create(payload) {
  const { idEquipo, fecha, modelo } = payload;

  assertString(idEquipo, "idEquipo");
  if (!fecha) {
    const err = new Error("Campo 'fecha' es requerido");
    err.status = 400;
    throw err;
  }
  const idModelo = assertInt(modelo, "modelo");

  await repo.create({ idEquipo: idEquipo.trim(), fecha, modelo: idModelo });
  return { Status: "Registro exitoso" };
}

async function updateEstado({ idEquipo, estado }) {
  if (!idEquipo || typeof idEquipo !== "string" || !idEquipo.trim()) {
    const err = new Error("idEquipo es requerido");
    err.status = 400;
    throw err;
  }
  const est = Number(estado);
  if (!Number.isInteger(est) || est < 1 || est > 3) {
    const err = new Error("estado inválido (use 1,2,3)");
    err.status = 400;
    throw err;
  }

  await repo.updateEstado(idEquipo.trim(), est);
  return { Status: "Actualizacion exitosa" };
}
async function contadoresByModelo(idModelo) {
  const id = assertInt(idModelo, "idModelo");
  return repo.getContadoresByModelo(id);
}

async function existsBySerie(numSerie) {
  assertString(numSerie, "numSerie");
  return repo.existsBySerie(numSerie.trim());
}

module.exports = {
  list,
  findByTipo,
  findByGroup,
  listGroup,
  listMarca,
  listModelo,
  create,
  updateEstado,
  contadoresByModelo,
  existsBySerie,
};