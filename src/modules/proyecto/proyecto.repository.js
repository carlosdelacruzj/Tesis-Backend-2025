const pool = require("../../db");

async function runCall(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
}

/* Proyecto */
async function getAllProyecto() {
  return runCall("CALL sp_proyecto_listar()");
}

async function getByIdProyecto(id) {
  return runCall("CALL sp_proyecto_obtener(?)", [Number(id)]);
}

async function postProyecto(payload) {
  const {
    proyecto_nombre,
    codigo_pedido,
    fecha_inicio_edicion,
    estado,
    responsableId,
    notas,
    enlace,
    fecha_fin_edicion,
    multimedia,
    edicion,
  } = payload;
  return runCall("CALL sp_proyecto_crear(?,?,?,?,?,?,?,?,?,?)", [
    proyecto_nombre ?? null,
    Number(codigo_pedido),
    estado ?? 1,
    responsableId ?? null,
    fecha_inicio_edicion ?? null,
    fecha_fin_edicion ?? null,
    enlace ?? null,
    notas ?? null,
    multimedia ?? null,
    edicion ?? null,
  ]);
}

async function putProyectoById(payload) {
  const {
    id,
    nombre,
    fecha_inicio_edicion,
    fecha_fin_edicion,
    estado,
    responsableId,
    notas,
    enlace,
    multimedia,
    edicion,
  } = payload;
  return runCall("CALL sp_proyecto_actualizar(?,?,?,?,?,?,?,?,?,?)", [
    Number(id),
    nombre ?? null,
    fecha_inicio_edicion ?? null,
    fecha_fin_edicion ?? null,
    estado ?? null,
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

module.exports = {
  getAllProyecto,
  getByIdProyecto,
  postProyecto,
  putProyectoById,
  deleteProyecto,
};
