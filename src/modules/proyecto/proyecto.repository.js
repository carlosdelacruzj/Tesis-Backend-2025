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

async function patchProyectoById(id, payload = {}) {
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

  // Sólo actualiza columnas si se envían; evita sobreescribir con NULL no enviado.
  // Usa un UPDATE directo para flexibilidad.
  const fields = [];
  const params = [];

  if (proyectoNombre !== undefined) {
    fields.push("Pro_Nombre = ?");
    params.push(proyectoNombre ?? null);
  }
  if (fechaInicioEdicion !== undefined) {
    fields.push("EPro_Fecha_Inicio_Edicion = ?");
    params.push(fechaInicioEdicion ?? null);
  }
  if (fechaFinEdicion !== undefined) {
    fields.push("Pro_Fecha_Fin_Edicion = ?");
    params.push(fechaFinEdicion ?? null);
  }
  if (estadoId !== undefined) {
    fields.push("Pro_Estado = ?");
    params.push(estadoId ?? null);
  }
  if (responsableId !== undefined) {
    fields.push("FK_Em_Cod = ?");
    params.push(responsableId ?? null);
  }
  if (notas !== undefined) {
    fields.push("Pro_Notas = ?");
    params.push(notas ?? null);
  }
  if (enlace !== undefined) {
    fields.push("Pro_Enlace = ?");
    params.push(enlace ?? null);
  }
  if (multimedia !== undefined) {
    fields.push("Pro_Revision_Multimedia = ?");
    params.push(multimedia ?? null);
  }
  if (edicion !== undefined) {
    fields.push("Pro_Revision_Edicion = ?");
    params.push(edicion ?? null);
  }

  if (!fields.length) {
    return { affectedRows: 0 };
  }

  params.push(Number(id));

  const [result] = await pool.query(
    `UPDATE T_Proyecto
     SET ${fields.join(", ")}
     WHERE PK_Pro_Cod = ?`,
    params
  );

  return { affectedRows: result.affectedRows };
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

async function listAsignacionesByProyecto(proyectoId) {
  return runCall("CALL sp_proyecto_asignaciones(?)", [Number(proyectoId)]);
}

async function resetRecursosProyecto(proyectoId) {
  return runCall("CALL sp_proyecto_recursos_reset(?)", [Number(proyectoId)]);
}

async function addProyectoRecurso({
  proyectoId,
  equipoId,
  empleadoId = null,
  fechaInicio,
  fechaFin,
  notas = null,
}) {
  return runCall("CALL sp_proyecto_recurso_agregar(?,?,?,?,?,?)", [
    Number(proyectoId),
    Number(equipoId),
    empleadoId == null ? null : Number(empleadoId),
    fechaInicio ?? null,
    fechaFin ?? null,
    notas ?? null,
  ]);
}

async function getDisponibilidad({
  fechaInicio,
  fechaFin,
  proyectoId = null,
  tipoEquipoId = null,
  cargoId = null,
}) {
  const sets = await runCallMulti("CALL sp_proyecto_disponibilidad(?,?,?,?,?)", [
    fechaInicio ?? null,
    fechaFin ?? null,
    proyectoId == null ? null : Number(proyectoId),
    tipoEquipoId == null ? null : Number(tipoEquipoId),
    cargoId == null ? null : Number(cargoId),
  ]);
  return {
    empleados: sets[0] || [],
    equipos: sets[1] || [],
  };
}

// Busca una asignación de equipo para un proyecto que no haya sido devuelta.
async function findAsignacionPendiente(proyectoId, equipoId) {
  const [rows] = await pool.query(
    `SELECT
       PK_EqAsig_Cod AS asignacionId,
       FK_Eq_Cod     AS equipoId,
       FK_Pro_Cod    AS proyectoId,
       EqAsig_Fecha_Inicio AS fechaInicio,
       EqAsig_Fecha_Fin    AS fechaFin,
       EqAsig_Estado       AS estado,
       EqAsig_Devuelto     AS devuelto
     FROM T_Equipo_Asignacion
     WHERE FK_Pro_Cod = ? AND FK_Eq_Cod = ? AND EqAsig_Devuelto = 0
     LIMIT 1`,
    [Number(proyectoId), Number(equipoId)]
  );
  return rows[0] || null;
}

// Marca una asignación como devuelta y almacena información de devolución.
async function marcarDevolucion({
  proyectoId,
  equipoId,
  estadoDevolucion,
  notas,
  usuarioId = null,
}) {
  await pool.query(
    `UPDATE T_Equipo_Asignacion
       SET EqAsig_Devuelto = 1,
           EqAsig_Fecha_Devolucion = NOW(),
           EqAsig_Estado_Devolucion = ?,
           EqAsig_Notas_Devolucion = ?,
           EqAsig_Usuario_Devolucion = ?
     WHERE FK_Pro_Cod = ? AND FK_Eq_Cod = ?`,
    [
      estadoDevolucion ?? null,
      notas ?? null,
      usuarioId ?? null,
      Number(proyectoId),
      Number(equipoId),
    ]
  );
}

module.exports = {
  getAllProyecto,
  getByIdProyecto,
  postProyecto,
  putProyectoById,
  deleteProyecto,
  getPagoInfoByPedido,
  listEstadoProyecto,
  listAsignacionesByProyecto,
  resetRecursosProyecto,
  addProyectoRecurso,
  getDisponibilidad,
  patchProyectoById,
  findAsignacionPendiente,
  marcarDevolucion,
};
