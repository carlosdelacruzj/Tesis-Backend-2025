// src/modules/proyecto/proyecto.repository.js
const pool = require("../../db");

async function runCall(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
}

/* Básicos */
function getAllProyecto() {
  return runCall("CALL SP_getAllProyecto()");
}
function getByIdProyecto(id) {
  return runCall("CALL SP_getByIdProyecto(?)", [Number(id)]);
}
function postProyecto({ proyecto_nombre, codigo_pedido, fecha_inicio_edicion }) {
  return runCall("CALL SP_postProyecto(?,?,?)", [
    proyecto_nombre?.trim() ?? null,
    Number(codigo_pedido),
    fecha_inicio_edicion, // 'YYYY-MM-DD'
  ]);
}
function putProyectoById({ finFecha, multimedia, edicion, enlace, id }) {
  return runCall("CALL SP_putProyectoById(?,?,?,?,?)", [
    finFecha ?? null,
    Number(multimedia),
    Number(edicion),
    enlace ?? null,
    Number(id),
  ]);
}

/* Pedidos */
function getAllPedidosContratado() {
  return runCall("CALL SP_getAllPedidosContratado()");
}

/* Asignaciones de equipos */
function getAllAsignarEquipos() {
  return runCall("CALL SP_getAllAsignarEquipos()");
}
function getAsignarEquiposById(id) {
  return runCall("CALL SP_getAsignarEquiposById(?)", [Number(id)]);
}
function postAsignarPersonalEquipo({ proyecto, empleado, equipos }) {
  return runCall("CALL SP_postAsignarPersonalEquipo(?,?,?)", [
    Number(proyecto),
    Number(empleado),
    (typeof equipos === "string" ? equipos.trim() : null),
  ]);
}
function putByIdAsignarPersonalEquipo({ id, empleado, equipo }) {
  return runCall("CALL SP_putByIdAsignarPersonalEquipo(?,?,?)", [
    Number(id),
    Number(empleado),
    (typeof equipo === "string" ? equipo.trim() : null),
  ]);
}
function deleteAsignarEquipoById(id) {
  return runCall("CALL SP_deleteAsignarEquipoById(?)", [Number(id)]);
}

/* Equipos filtrados + eventos */
function getAllEquiposFiltrados({ fecha, proyecto, idTipoEquipo }) {
  const f = fecha ? String(fecha).slice(0, 10) : null; // YYYY-MM-DD
  const p = proyecto != null ? Number(proyecto) : null;
  const t = idTipoEquipo != null ? Number(idTipoEquipo) : null;
  return runCall("CALL SP_getAllEquiposFiltrados(?,?,?)", [f, p, t]);
}
function getAllEventosProyectoById(id) {
  return runCall("CALL SP_getAllEventosProyectoById(?)", [Number(id)]);
}

module.exports = {
  /* proyecto */
  getAllProyecto,
  getByIdProyecto,
  postProyecto,
  putProyectoById,

  /* pedidos */
  getAllPedidosContratado,

  /* asignaciones */
  getAllAsignarEquipos,
  getAsignarEquiposById,
  postAsignarPersonalEquipo,
  putByIdAsignarPersonalEquipo,
  deleteAsignarEquipoById,

  /* util */
  getAllEquiposFiltrados,
  getAllEventosProyectoById,
};
