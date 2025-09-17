// src/modules/pedido/pedido.repository.js
const pool = require("../../db");

async function runCall(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
}

const t = (v) => (typeof v === "string" ? v.trim() : v ?? null);

async function getAll() {
  return runCall("CALL SP_getAllPedido()");
}

async function getIndex() {
  return runCall("CALL SP_getIndexPedido()");
}

async function getById(id) {
  try {
    const result = await runCall("CALL SP_getByIDPedido(?)", [id]);
    return result[0] || null;
  } catch (err) {
    err.message = `[pedido.repo] getById: ${err.message}`;
    throw err;
  }
}

async function getLastEstado() {
  const result = await runCall("CALL SP_getLastEstadoPedido()");
  return result[0] || null;
}

async function create({ ExS, doc, fechaCreate, fechaEvent, horaEvent, CodEmp, Direccion }) {
  const params = [ ExS, t(doc), fechaCreate, fechaEvent, horaEvent, CodEmp, t(Direccion) ];
  const result = await runCall("CALL SP_postPedido(?,?,?,?,?,?,?)", params);
  return result[0];
}

async function updateById({ id, estadoPedido, fechaEvent, horaEvent, lugar, empleado, estadoPago }) {
  const params = [ Number(id), estadoPedido, fechaEvent, horaEvent, t(lugar), empleado, estadoPago ];
  const result = await runCall("CALL SP_putByIdPedido(?,?,?,?,?,?,?)", params);
  return result[0];
}

module.exports = {
  getAll,
  getIndex,
  getById,
  getLastEstado,
  create,
  updateById,
};