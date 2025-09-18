const repo = require("./proyecto.repository");

function assertInt(v, name) {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) {
    const err = new Error(`Campo '${name}' inválido`);
    err.status = 400;
    throw err;
  }
  return n;
}
function assertStr(v, name) {
  if (typeof v !== "string" || !v.trim()) {
    const err = new Error(`Campo '${name}' es requerido`);
    err.status = 400;
    throw err;
  }
  return v.trim();
}

/* Proyecto */
async function listProyecto() { return repo.getAllProyecto(); }
async function findProyectoById(id) {
  const n = assertInt(id, "id");
  const data = await repo.getByIdProyecto(n);
  if (!data || data.length === 0) {
    const err = new Error("Proyecto no encontrado");
    err.status = 404;
    throw err;
  }
  return data;
}
async function createProyecto(payload) {
  const proyecto_nombre = assertStr(payload.proyecto_nombre, "proyecto_nombre");
  const codigo_pedido = assertInt(payload.codigo_pedido, "codigo_pedido");
  if (!payload.fecha_inicio_edicion) {
    const err = new Error("fecha_inicio_edicion es requerido (YYYY-MM-DD)");
    err.status = 400;
    throw err;
  }
  await repo.postProyecto({ proyecto_nombre, codigo_pedido, fecha_inicio_edicion: payload.fecha_inicio_edicion });
  return { Status: "Registro exitoso" };
}
async function updateProyecto(payload) {
  const id = assertInt(payload.id, "id");
  await repo.putProyectoById({
    finFecha: payload.finFecha ?? null,
    multimedia: payload.multimedia ?? 0,
    edicion: payload.edicion ?? 0,
    enlace: payload.enlace ?? null,
    id,
  });
  return { Status: "Actualización exitosa" };
}

/* Pedidos */
async function listPedidosContratado() { return repo.getAllPedidosContratado(); }

/* Asignaciones */
async function listAsignaciones() { return repo.getAllAsignarEquipos(); } // ✅ sin id
async function listAsignacionesByProyecto(id) {
  const n = assertInt(id, "id");
  const data = await repo.getAsignarEquiposById(n);
  if (!data || data.length === 0) {
    const err = new Error("Sin asignaciones para este proyecto");
    err.status = 404;
    throw err;
  }
  return data;
}
async function createAsignacion(payload) {
  const proyecto = assertInt(payload.proyecto, "proyecto");
  const empleado = assertInt(payload.empleado, "empleado");
  const equipos = assertStr(payload.equipos, "equipos");
  await repo.postAsignarPersonalEquipo({ proyecto, empleado, equipos });
  return { Status: "Registro exitoso" };
}
async function updateAsignacion(payload) {
  const id = assertInt(payload.id, "id");
  const empleado = assertInt(payload.empleado, "empleado");
  const equipo = assertStr(payload.equipo, "equipo");
  await repo.putByIdAsignarPersonalEquipo({ id, empleado, equipo });
  return { Status: "Actualización exitosa" };
}
async function deleteAsignacion(id) {
  const n = assertInt(id, "id");
  await repo.deleteAsignarEquipoById(n);
  return { Status: "Eliminada" };
}

/* Util */
async function listEquiposFiltrados(query) {
  return repo.getAllEquiposFiltrados({
    fecha: query.fecha ?? null,
    proyecto: query.proyecto ?? null,
    idTipoEquipo: query.idTipoEquipo ?? null,
  });
}
async function listEventosByProyecto(id) {
  const n = assertInt(id, "id");
  return repo.getAllEventosProyectoById(n);
}

module.exports = {
  listProyecto,
  findProyectoById,
  createProyecto,
  updateProyecto,
  listPedidosContratado,
  listAsignaciones,
  listAsignacionesByProyecto,
  createAsignacion,
  updateAsignacion,
  deleteAsignacion,
  listEquiposFiltrados,
  listEventosByProyecto,
};
