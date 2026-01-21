const pool = require("../../db");
const { getLimaDateTimeString } = require("../../utils/dates");

async function runCall(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
}

const nombreCache = {
  metodoPago: new Map(),
  estadoVoucher: new Map(),
  estadoPago: new Map(),
  estadoPedido: new Map(),
};

async function getIdByNombre({ table, idCol, nameCol, nombre, cache }) {
  const key = String(nombre || "").trim().toLowerCase();
  if (!key) throw new Error(`Nombre requerido para ${table}`);
  if (cache.has(key)) return cache.get(key);
  const [rows] = await pool.query(
    `SELECT ${idCol} AS id FROM ${table} WHERE LOWER(${nameCol}) = LOWER(?) LIMIT 1`,
    [nombre]
  );
  const id = rows?.[0]?.id;
  if (!id) {
    throw new Error(`No se encontro ${table} para nombre: ${nombre}`);
  }
  cache.set(key, Number(id));
  return Number(id);
}

async function getMetodoPagoIdByNombre(nombre) {
  return getIdByNombre({
    table: "T_Metodo_Pago",
    idCol: "PK_MP_Cod",
    nameCol: "MP_Nombre",
    nombre,
    cache: nombreCache.metodoPago,
  });
}

async function getEstadoVoucherIdByNombre(nombre) {
  return getIdByNombre({
    table: "T_Estado_voucher",
    idCol: "PK_EV_Cod",
    nameCol: "EV_Nombre",
    nombre,
    cache: nombreCache.estadoVoucher,
  });
}

async function getEstadoPagoIdByNombre(nombre) {
  return getIdByNombre({
    table: "T_Estado_Pago",
    idCol: "PK_ESP_Cod",
    nameCol: "ESP_Nombre",
    nombre,
    cache: nombreCache.estadoPago,
  });
}

async function getEstadoPedidoIdByNombre(nombre) {
  return getIdByNombre({
    table: "T_Estado_Pedido",
    idCol: "PK_EP_Cod",
    nameCol: "EP_Nombre",
    nombre,
    cache: nombreCache.estadoPedido,
  });
}

// === Listados por estado de pago ===
async function listPendientes() {
  return runCall("CALL sp_pedido_saldo_listar_pendientes()");
}
async function listParciales() {
  return runCall("CALL sp_pedido_saldo_listar_parciales()");
}
async function listPagados() {
  return runCall("CALL sp_pedido_saldo_listar_pagados()");
}

// === Resumen y vouchers por pedido ===
async function getResumenByPedido(pedidoId) {
  return runCall("CALL sp_pedido_pago_resumen(?)", [Number(pedidoId)]);
}
async function listVouchersByPedido(pedidoId) {
  return runCall("CALL sp_voucher_listar_por_pedido_detalle(?,?)", [
    Number(pedidoId),
    getLimaDateTimeString(),
  ]);
}
// === Catálogos ===
async function listMetodos() {
  return runCall("CALL sp_metodo_pago_listar()");
}

async function listEstadosPago() {
  const [rows] = await pool.query(
    `SELECT
       PK_ESP_Cod AS id,
       ESP_Nombre AS nombre
     FROM T_Estado_Pago
     ORDER BY PK_ESP_Cod`
  );
  return rows;
}

async function updatePedidoEstadoPago(pedidoId, estadoPagoId) {
  const [result] = await pool.query(
    "UPDATE T_Pedido SET FK_ESP_Cod = ? WHERE PK_P_Cod = ?",
    [Number(estadoPagoId), Number(pedidoId)]
  );
  return result.affectedRows > 0;
}

async function marcarPedidosPagoVencido({
  fechaCorte,
  pendienteId,
  vencidoId,
  pedidoExpiradoId,
}) {
  const [result] = await pool.query(
    `UPDATE T_Pedido p
     JOIN V_Pedido_Saldos s ON s.PedidoId = p.PK_P_Cod
     JOIN (
       SELECT FK_P_Cod AS pedidoId, MIN(PE_Fecha) AS fechaEvento
       FROM T_PedidoEvento
       GROUP BY FK_P_Cod
     ) ev ON ev.pedidoId = p.PK_P_Cod
     SET p.FK_ESP_Cod = ?,
         p.FK_EP_Cod = ?
     WHERE p.FK_ESP_Cod = ?
       AND COALESCE(s.MontoAbonado, 0) <= 0
       AND ev.fechaEvento IS NOT NULL
       AND (
         ev.fechaEvento <= ?
         OR p.P_Fecha_Creacion <= DATE_SUB(?, INTERVAL 90 DAY)
         OR (
           ev.fechaEvento <= DATE_ADD(?, INTERVAL 7 DAY)
           AND NOT (DATEDIFF(ev.fechaEvento, p.P_Fecha_Creacion) BETWEEN 1 AND 7)
         )
       )`,
    [
      Number(vencidoId),
      Number(pedidoExpiradoId),
      Number(pendienteId),
      fechaCorte,
      fechaCorte,
      fechaCorte,
    ]
  );
  return result.affectedRows || 0;
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
  return runCall("CALL sp_voucher_crear(?,?,?,?,?,?,?,?,?)", [
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

// Cambia el estado del pedido a "Contratado" solo si esta en "Cotizado"
async function updatePedidoEstadoContratadoByIds(
  pedidoId,
  contratadoId,
  cotizadoId
) {
  const [result] = await pool.query(
    "UPDATE T_Pedido SET FK_EP_Cod = ? WHERE PK_P_Cod = ? AND FK_EP_Cod = ?",
    [Number(contratadoId), Number(pedidoId), Number(cotizadoId)]
  );
  return result.affectedRows > 0;
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
  listEstadosPago,
  getMetodoPagoIdByNombre,
  getEstadoVoucherIdByNombre,
  getEstadoPagoIdByNombre,
  getEstadoPedidoIdByNombre,
  insertVoucher,
  getVoucherById,
  listAllVouchers,
  findVoucherMetaById,
  updateVoucher,
  updatePedidoEstadoContratadoByIds,
  updatePedidoEstadoPago,
  marcarPedidosPagoVencido,
  deleteVoucher,
};



