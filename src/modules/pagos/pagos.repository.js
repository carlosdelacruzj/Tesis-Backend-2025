const pool = require("../../db");

async function runCall(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
}

// === Listados por estado de pago ===
async function listPendientes() {
  return runCall("CALL SP_getPedidosPendientes()");
}
async function listParciales() {
  return runCall("CALL SP_getPedidosParciales()");
}
async function listPagados() {
  return runCall("CALL SP_getPedidosPagados()");
}

// === Resumen y vouchers por pedido ===
async function getResumenByPedido(pedidoId) {
  return runCall("CALL SP_getResumenPagoPedido(?)", [Number(pedidoId)]);
}
async function listVouchersByPedido(pedidoId) {
  return runCall("CALL SP_getVouchersByPedido(?)", [Number(pedidoId)]);
}

// === Catálogos ===
async function listMetodos() {
  return runCall("CALL SP_getAllMetodoPago()");
}

// === Crear voucher ===
// Si tu SP admite 'fecha', acá agregas ese parámetro (y en service/controller lo enviamos)
async function insertVoucher({
  monto,
  metodoPagoId,
  estadoVoucherId,
  imagen,
  pedidoId,
  fecha,
  mime,
  nombre,
  size,
}) {
  return runCall("CALL SP_postVoucher(?,?,?,?,?,?,?,?,?)", [
    monto,
    metodoPagoId,
    estadoVoucherId,
    imagen, // Buffer → BLOB
    pedidoId,
    fecha,
    mime,
    nombre,
    size,
  ]);
}
async function getVoucherById(id) {
  const [rows] = await pool.execute(
    `SELECT 
       Pa_Imagen_Voucher,
       Pa_Imagen_Mime,
       Pa_Imagen_NombreOriginal,
       Pa_Imagen_Size
     FROM T_Voucher
     WHERE PK_Pa_Cod = ?`,
    [id]
  );
  return rows[0];
}

module.exports = {
  listPendientes,
  listParciales,
  listPagados,
  getResumenByPedido,
  listVouchersByPedido,
  listMetodos,
  insertVoucher,
  getVoucherById
};
