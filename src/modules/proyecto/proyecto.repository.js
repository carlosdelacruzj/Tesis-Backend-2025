const pool = require("../../db");

async function runCall(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
}

/* Proyecto */
function getAllProyecto() {
  return runCall("CALL sp_proyecto_listar()");
}
function getByIdProyecto(id) {
  return runCall("CALL sp_proyecto_obtener(?)", [Number(id)]);
}
function postProyecto({ proyecto_nombre, codigo_pedido, fecha_inicio_edicion }) {
  return runCall("CALL sp_proyecto_crear(?,?,?)", [
    proyecto_nombre?.trim() ?? null,
    Number(codigo_pedido),
    fecha_inicio_edicion,
  ]);
}
function putProyectoById({ finFecha, multimedia, edicion, enlace, id }) {
  return runCall("CALL sp_proyecto_actualizar(?,?,?,?,?)", [
    finFecha ?? null,
    Number(multimedia),
    Number(edicion),
    enlace ?? null,
    Number(id),
  ]);
}

/* Pedidos */
function getAllPedidosContratado() {
  return runCall("CALL sp_pedido_listar_contratados()");
}

/* Asignaciones */
function getAllAsignarEquipos() {
  return runCall("CALL sp_proyecto_asignacion_personal_listar()"); // ✅ sin id
}
function getAsignarEquiposById(id) {
  return runCall("CALL sp_proyecto_asignacion_personal_obtener(?)", [Number(id)]);
}
function postAsignarPersonalEquipo({ proyecto, empleado, equipos }) {
  return runCall("CALL sp_proyecto_asignacion_personal_crear(?,?,?)", [
    Number(proyecto),
    Number(empleado),
    (typeof equipos === "string" ? equipos.trim() : null),
  ]);
}
function putByIdAsignarPersonalEquipo({ id, empleado, equipo }) {
  return runCall("CALL sp_proyecto_asignacion_personal_actualizar(?,?,?)", [
    Number(id),
    Number(empleado),
    (typeof equipo === "string" ? equipo.trim() : null),
  ]);
}
function deleteAsignarEquipoById(id) {
  return runCall("CALL sp_proyecto_asignacion_personal_eliminar(?)", [Number(id)]);
}

/* Util */
function getAllEquiposFiltrados({ fecha, proyecto, idTipoEquipo }) {
  const f = fecha ? String(fecha).slice(0, 10) : null;
  const p = proyecto != null ? Number(proyecto) : null;
  const t = idTipoEquipo != null ? Number(idTipoEquipo) : null;
  return runCall("CALL sp_equipo_listar_filtrados(?,?,?)", [f, p, t]);
}
function getAllEventosProyectoById(id) {
  return runCall("CALL sp_proyecto_evento_listar(?)", [Number(id)]);
}

module.exports = {
  getAllProyecto,
  getByIdProyecto,
  postProyecto,
  putProyectoById,
  getAllPedidosContratado,
  getAllAsignarEquipos,
  getAsignarEquiposById,
  postAsignarPersonalEquipo,
  putByIdAsignarPersonalEquipo,
  deleteAsignarEquipoById,
  getAllEquiposFiltrados,
  getAllEventosProyectoById,
};
