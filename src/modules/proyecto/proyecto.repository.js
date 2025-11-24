const pool = require("../../db");

async function runCall(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
}

// Para SP que devuelven múltiples result sets (proyecto + recursos, etc.)
async function runCallMulti(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return Array.isArray(rows) ? rows.filter(Array.isArray) : [];
}

/* Proyecto */
async function getAllProyecto() {
  return runCall("CALL sp_proyecto_listar()");
}

async function getByIdProyecto(id) {
  // Se espera que el SP retorne:
  //   result set 0: una sola fila con los campos del proyecto
  //   result set 1: lista de recursos asociados al proyecto
  const sets = await runCallMulti("CALL sp_proyecto_obtener(?)", [Number(id)]);
  return {
    proyecto: sets[0]?.[0] || null,
    recursos: sets[1] || [],
  };
}

async function postProyecto(payload) {
  const {
    proyectoNombre,
    pedidoId,
    fechaInicioEdicion,
    fechaFinEdicion,
    estadoId,
    responsableId,
    notas,
    enlace,
    multimedia,
    edicion,
  } = payload;
  return runCall("CALL sp_proyecto_crear(?,?,?,?,?,?,?,?,?,?)", [
    proyectoNombre ?? null,
    Number(pedidoId),
    estadoId ?? 1,
    responsableId ?? null,
    fechaInicioEdicion ?? null,
    fechaFinEdicion ?? null,
    enlace ?? null,
    notas ?? null,
    multimedia ?? null,
    edicion ?? null,
  ]);
}

async function putProyectoById(id, payload) {
  const {
    proyectoNombre,
    fechaInicioEdicion,
    fechaFinEdicion,
    estadoId,
    responsableId,
    notas,
    enlace,
    multimedia,
    edicion,
  } = payload;
  return runCall("CALL sp_proyecto_actualizar(?,?,?,?,?,?,?,?,?,?)", [
    Number(id),
    proyectoNombre ?? null,
    fechaInicioEdicion ?? null,
    fechaFinEdicion ?? null,
    estadoId ?? null,
    responsableId ?? null,
    notas ?? null,
    enlace ?? null,
    multimedia ?? null,
    edicion ?? null,
  ]);
}

async function deleteProyecto(id) {
  return runCall("CALL sp_proyecto_eliminar(?)", [Number(id)]);
}

async function getPagoInfoByPedido(pedidoId) {
  const [rows] = await pool.query(
    "SELECT SaldoPendiente, MontoAbonado, EstadoPagoId FROM V_Pedido_Saldos WHERE PedidoId = ?",
    [Number(pedidoId)]
  );
  return rows;
}

async function listEstadoProyecto() {
  const [rows] = await pool.query(
    `SELECT
       PK_EPro_Cod AS estadoId,
       EPro_Nombre AS estadoNombre,
       EPro_Orden  AS orden,
       Activo      AS activo
     FROM T_Estado_Proyecto
     ORDER BY EPro_Orden, PK_EPro_Cod`
  );
  return rows;
}

module.exports = {
  getAllProyecto,
  getByIdProyecto,
  postProyecto,
  putProyectoById,
  deleteProyecto,
  getPagoInfoByPedido,
  listEstadoProyecto,
};
