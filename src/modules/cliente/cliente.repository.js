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

/**
 * Autocompletado por DNI/RUC, correo, celular, nombre o apellido.
 * - query: string (requerido, ideal >= 2 chars)
 * - limit: number (opcional, default 10; el SP acota 1..50)
 * Retorna un array de filas: [{ idCliente, codigoCliente, nombre, apellido, correo, celular, doc, direccion }]
 */
async function autocomplete({ query, limit = 10 }) {
  const q = t(query);
  if (!q || q.length < 2) return []; // evita llamadas innecesarias
  const lim = Number.isFinite(limit) ? Number(limit) : 10;
  return runCall("CALL SP_autocompleteClientes(?, ?)", [q, lim]);
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
  autocomplete, // <-- nuevo método exportado
  create,
  updateById,
};
