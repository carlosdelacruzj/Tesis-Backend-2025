const pool = require("../../db");

async function runCall(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
}

const t = (v) => (typeof v === "string" ? v.trim() : v ?? null);

// --- Consultas ---
async function getPedidosByEstado(idEstado) {
  return runCall("CALL SP_getAllPedidoVoucher(?)", [Number(idEstado)]);
}
async function getAllByPedido(idPedido) {
  return runCall("CALL SP_getAllVoucherByPedido(?)", [Number(idPedido)]);
}
async function getByPedido(idPedido) {
  return runCall("CALL SP_getVoucherByPedido(?)", [Number(idPedido)]);
}
async function getMetodosPago() {
  return runCall("CALL SP_getAllMetodoPago()");
}
async function getEstados() {
  return runCall("CALL SP_getAllEstadoVoucher()");
}

// --- Mutaciones ---
async function create({ monto, metodoPago, estadoVoucher, imagen, idPedido }) {
  await runCall("CALL SP_postVoucher(?,?,?,?,?)", [
    Number(monto),
    Number(metodoPago),
    Number(estadoVoucher),
    t(imagen),
    Number(idPedido),
  ]);
}
module.exports = {
  getPedidosByEstado,
  getAllByPedido,
  getByPedido,
  getMetodosPago,
  getEstados,
  create,
};
