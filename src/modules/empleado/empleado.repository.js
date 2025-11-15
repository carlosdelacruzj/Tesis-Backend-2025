// src/modules/empleado/empleado.repository.js
const pool = require("../../db");

async function runCall(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
}

const t = (v) => (typeof v === "string" ? v.trim() : v ?? null);

// Lecturas
async function getAll() {
  return runCall("CALL sp_empleado_listar()");
}

async function getList() {
  return runCall("CALL sp_empleado_listar_catalogo()");
}

async function getDisponiblesByProyecto(idProyecto) {
  return runCall("CALL sp_empleado_listar_disponibles(?)", [Number(idProyecto)]);
}

async function getCargos() {
  return runCall("CALL sp_empleado_cargo_listar()");
}

async function getById(id) {
  try {
    return await runCall("CALL sp_empleado_obtener(?)", [Number(id)]);
  } catch (err) {
    err.message = `[empleado.repo] getById: ${err.message}`;
    throw err;
  }
}

// Escrituras
async function create({ nombre, apellido, correo, celular, documento, direccion, autonomo, cargo }) {
  await runCall("CALL sp_empleado_crear(?,?,?,?,?,?,?,?)", [
    t(nombre),
    t(apellido),
    t(correo),
    t(celular),
    t(documento),
    t(direccion),
    autonomo != null ? Number(autonomo) : null,
    cargo != null ? Number(cargo) : null,
  ]);
}

async function updateById({ idEmpleado, celular, correo, direccion, estado }) {
  // Firma del SP (según legacy): (ID, Celular, Correo, Direccion, Estado)
  await runCall("CALL sp_empleado_actualizar(?,?,?,?,?)", [
    Number(idEmpleado),
    t(celular),
    t(correo),
    t(direccion),
    estado != null ? Number(estado) : null,
  ]);
}

module.exports = {
  getAll,
  getList,
  getDisponiblesByProyecto,
  getCargos,
  getById,
  create,
  updateById,
};
