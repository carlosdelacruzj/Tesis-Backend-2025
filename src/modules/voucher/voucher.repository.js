const pool = require("../../db");

async function runCall(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
}

const t = (v) => (typeof v === "string" ? v.trim() : v ?? null);

// --- Consultas ---
async function getPedidosByEstado(idEstado) {
  return runCall("CALL sp_voucher_listar_ultimos_por_estado(?)", [Number(idEstado)]);
}
async function getAllByPedido(idPedido) {
  return runCall("CALL sp_voucher_listar_por_pedido(?)", [Number(idPedido)]);
}
async function getByPedido(idPedido) {
  return runCall("CALL sp_voucher_obtener_por_pedido(?)", [Number(idPedido)]);
}
async function getMetodosPago() {
  return runCall("CALL sp_metodo_pago_listar()");
}
async function getEstados() {
  return runCall("CALL sp_voucher_estado_listar()");
}

// --- Mutaciones ---
async function create({ monto, metodoPago, estadoVoucher, imagen, idPedido }) {
  await runCall("CALL sp_voucher_crear(?,?,?,?,?)", [
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
