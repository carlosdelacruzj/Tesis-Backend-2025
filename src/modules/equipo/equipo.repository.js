// src/modules/equipo/equipo.repository.js
const pool = require("../../db");

/**
 * Normaliza el resultado de un CALL.
 * Devuelve siempre el primer recordset útil (array de filas) o rows si no aplica.
 */
async function runCall(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
}

const t = (v) => (typeof v === "string" ? v.trim() : v ?? null);

// --- Consultas ---
async function getAll() {
  return runCall("CALL SP_getAllEquipos()");
}

async function getByTipoEquipo(idTipoEquipo) {
  return runCall("CALL SP_getByTipoEquipo(?)", [Number(idTipoEquipo)]);
}

async function getByGroup({ tipoEquipo, marca, modelo }) {
  return runCall("CALL SP_getAllEquiposByIdGroup(?,?,?)", [
    Number(tipoEquipo),
    Number(marca),
    Number(modelo),
  ]);
}

async function getAllGroup() {
  return runCall("CALL SP_getAllEquiposGroup()");
}

async function getAllMarca() {
  return runCall("CALL SP_getAllMarca()");
}

async function getAllModelo({ marca, tipo }) {
  return runCall("CALL SP_getAllModelo(?,?)", [Number(marca), Number(tipo)]);
}

async function getContadoresByModelo(idModelo) {
  console.log("idModelo", idModelo);
  return runCall("CALL SP_getAllContadoresEquiposEstado(?)", [
    Number(idModelo),
  ]);
}

async function existsBySerie(numSerie) {
  return runCall("CALL SP_getExistEquipo(?)", [t(numSerie)]);
}

// --- Mutaciones ---
async function create({ idEquipo, fecha, modelo }) {
  await runCall("CALL SP_postEquipo(?,?,?)", [
    t(idEquipo),
    fecha, // debería venir en formato válido para DATE/DATETIME
    Number(modelo),
  ]);
}

async function updateEstado(idEquipo, estado) {
  await runCall("CALL SP_putEstadoEquipo(?, ?)", [idEquipo, Number(estado)]);
}

module.exports = {
  getAll,
  getByTipoEquipo,
  getByGroup,
  getAllGroup,
  getAllMarca,
  getAllModelo,
  getContadoresByModelo,
  existsBySerie,
  create,
  updateEstado,
};