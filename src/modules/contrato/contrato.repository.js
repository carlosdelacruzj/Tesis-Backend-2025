const pool = require("../../db");

async function runCall(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
}

async function getAll() {
  return runCall("CALL sp_contrato_listar()");
}

async function getAllByPedido(pedidoId) {
  return runCall("CALL sp_contrato_listar_por_pedido(?)", [Number(pedidoId)]);
}

module.exports = { getAll, getAllByPedido };
