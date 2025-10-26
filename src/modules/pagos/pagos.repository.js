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

// === CRUD directo sobre T_Voucher ===
async function listAllVouchers() {
  const [rows] = await pool.query(
    `SELECT
       v.PK_Pa_Cod       AS id,
       v.FK_P_Cod        AS pedidoId,
       v.Pa_Monto_Depositado AS monto,
       v.Pa_Fecha        AS fecha,
       v.FK_MP_Cod       AS metodoPagoId,
       mp.MP_Nombre      AS metodoPagoNombre,
       v.FK_EV_Cod       AS estadoVoucherId,
       ev.EV_Nombre      AS estadoVoucherNombre,
       v.Pa_Imagen_NombreOriginal AS archivoNombre,
       v.Pa_Imagen_Size  AS archivoSize,
       v.Pa_Imagen_Mime  AS archivoMime
     FROM T_Voucher v
     LEFT JOIN T_Metodo_Pago mp ON mp.PK_MP_Cod = v.FK_MP_Cod
     LEFT JOIN T_Estado_voucher ev ON ev.PK_EV_Cod = v.FK_EV_Cod
     ORDER BY v.Pa_Fecha DESC, v.PK_Pa_Cod DESC`
  );
  return rows;
}

async function findVoucherMetaById(id) {
  const [rows] = await pool.query(
    `SELECT
       v.PK_Pa_Cod       AS id,
       v.FK_P_Cod        AS pedidoId,
       v.Pa_Monto_Depositado AS monto,
       v.Pa_Fecha        AS fecha,
       v.FK_MP_Cod       AS metodoPagoId,
       mp.MP_Nombre      AS metodoPagoNombre,
       v.FK_EV_Cod       AS estadoVoucherId,
       ev.EV_Nombre      AS estadoVoucherNombre,
       v.Pa_Imagen_NombreOriginal AS archivoNombre,
       v.Pa_Imagen_Size  AS archivoSize,
       v.Pa_Imagen_Mime  AS archivoMime
     FROM T_Voucher v
     LEFT JOIN T_Metodo_Pago mp ON mp.PK_MP_Cod = v.FK_MP_Cod
     LEFT JOIN T_Estado_voucher ev ON ev.PK_EV_Cod = v.FK_EV_Cod
     WHERE v.PK_Pa_Cod = ?`,
    [Number(id)]
  );
  return rows[0] || null;
}

async function updateVoucher({
  id,
  monto,
  metodoPagoId,
  estadoVoucherId,
  fecha,
  imagen, // undefined => no tocar, null => limpiar
  mime,
  nombre,
  size,
}) {
  const sets = [
    "Pa_Monto_Depositado = ?",
    "FK_MP_Cod = ?",
    "FK_EV_Cod = ?",
    "Pa_Fecha = ?",
  ];
  const params = [monto, metodoPagoId, estadoVoucherId, fecha];

  if (imagen !== undefined) {
    sets.push(
      "Pa_Imagen_Voucher = ?",
      "Pa_Imagen_Mime = ?",
      "Pa_Imagen_NombreOriginal = ?",
      "Pa_Imagen_Size = ?"
    );
    params.push(imagen, mime, nombre, size);
  }

  params.push(Number(id));

  const [result] = await pool.query(
    `UPDATE T_Voucher SET ${sets.join(", ")} WHERE PK_Pa_Cod = ?`,
    params
  );
  return result.affectedRows;
}

async function deleteVoucher(id) {
  const [result] = await pool.query(
    "DELETE FROM T_Voucher WHERE PK_Pa_Cod = ?",
    [Number(id)]
  );
  return result.affectedRows;
}

module.exports = {
  listPendientes,
  listParciales,
  listPagados,
  getResumenByPedido,
  listVouchersByPedido,
  listMetodos,
  insertVoucher,
  getVoucherById,
  listAllVouchers,
  findVoucherMetaById,
  updateVoucher,
  deleteVoucher,
};
