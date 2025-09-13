// src/modules/cliente/cliente.repository.js
const pool = require("../../db");

/**
 * Normaliza el resultado de un CALL.
 * mysql2/promise: const [rows] = await pool.query(...)
 * En CALL, rows puede venir como [ [resultset], meta, ... ].
 * Devolvemos siempre el primer recordset útil (array de filas) o rows si no aplica.
 */
async function runCall(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
}

const t = (v) => (typeof v === "string" ? v.trim() : v ?? null);

// --- Consultas ---
async function getAll() {
  return runCall("CALL SP_getAllClientes()");
}

async function getById(id) {
  try {
    return await runCall("CALL SP_getByIdCliente(?)", [id]);
  } catch (err) {
    err.message = `[cliente.repo] getById: ${err.message}`;
    throw err;
  }
}

async function getByDoc(doc) {
  return runCall("CALL SP_getDataCliente(?)", [doc]);
}

// --- Mutaciones ---
async function create({ nombre, apellido, correo, numDoc, celular, direccion }) {
  // Si tu SP hace SELECT del nuevo id, runCall() lo devolverá. Tu service hoy no lo usa.
  await runCall("CALL SP_postCliente(?,?,?,?,?,?)", [
    t(nombre),
    t(apellido),
    t(correo),
    t(numDoc),
    t(celular),
    t(direccion),
  ]);
}

async function updateById({ idCliente, correo, celular, direccion }) {
  await runCall("CALL SP_putClienteById(?,?,?,?)", [
    Number(idCliente),
    t(correo),
    t(celular),
    t(direccion),
  ]);
}

module.exports = {
  getAll,
  getById,
  getByDoc,
  create,
  updateById,
};
