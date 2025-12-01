const repo = require("./proyecto.repository");
const equipoService = require("../inventario/equipo/equipo.service");

const ESTADO_MANTENIMIENTO = 12;
const ESTADO_BAJA = 13;

function ensurePositiveInt(value, field) {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) {
    const err = new Error(`${field} es requerido y debe ser entero positivo`);
    err.status = 400;
    throw err;
  }
  return num;
}

/* Proyecto */
async function listProyecto() {
  return repo.getAllProyecto();
}
async function findProyectoById(id) {
  const data = await repo.getByIdProyecto(id);
  const row = data?.proyecto ?? (Array.isArray(data) ? data[0] : data);
  const recursos = Array.isArray(data?.recursos) ? data.recursos : [];
  if (!row) {
    const err = new Error("Proyecto no encontrado");
    err.status = 404;
    throw err;
  }
  return { ...row, recursos };
}
async function createProyecto(payload) {
  const pedidoId = payload.pedidoId;
  if (!pedidoId) {
    const err = new Error("pedidoId es requerido");
    err.status = 400;
    throw err;
  }

  // Validar que exista pago abonado (>0)
  const pagoInfo = await repo.getPagoInfoByPedido(pedidoId);
  const pagoRow = Array.isArray(pagoInfo) ? pagoInfo[0] : pagoInfo;
  if (!pagoRow || Number(pagoRow.MontoAbonado || 0) <= 0) {
    const err = new Error("Debe registrarse un pago inicial antes de crear el proyecto");
    err.status = 400;
    throw err;
  }

  const result = await repo.postProyecto(payload);
  const first = Array.isArray(result) ? result[0] : result;
  return { status: "Registro exitoso", proyectoId: first?.proyectoId ?? null };
}
async function updateProyecto(id, payload) {
  await repo.putProyectoById(id, payload);
  return { status: "Actualización exitosa", proyectoId: Number(id) };
}

async function addRecurso(payload = {}) {
  const proyectoIdGlobal = payload.proyectoId;
  const lista = Array.isArray(payload.asignaciones) ? payload.asignaciones : null;

  // Soporta body plano (legacy) o con arreglo "asignaciones"
  const items = lista && lista.length ? lista : [payload];

  // Si viene arreglo (pantalla completa), limpiar previo y reinsertar todo
  if (lista && lista.length) {
    const pid = proyectoIdGlobal ?? lista[0]?.proyectoId;
    if (!pid) {
      const err = new Error("proyectoId es requerido en el payload");
      err.status = 400;
      throw err;
    }
    await repo.resetRecursosProyecto(pid);
  }

  const results = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i] || {};
    const {
      proyectoId = proyectoIdGlobal,
      equipoId,
      empleadoId = null,
      fechaInicio,
      fechaFin,
      notas = null,
    } = item;

    if (!proyectoId || !equipoId || !fechaInicio || !fechaFin) {
      const err = new Error("proyectoId, equipoId, fechaInicio y fechaFin son requeridos");
      err.status = 400;
      throw err;
    }

    const r = await repo.addProyectoRecurso({
      proyectoId,
      equipoId,
      empleadoId,
      fechaInicio,
      fechaFin,
      notas,
    });
    const first = Array.isArray(r) ? r[0] : r;
    results.push({
      index: i,
      proyectoId: Number(proyectoId),
      equipoId: Number(equipoId),
      empleadoId: empleadoId == null ? null : Number(empleadoId),
      recursoId: first?.recursoId ?? null,
    });
  }

  return {
    status: items.length > 1 ? "Recursos agregados" : "Recurso agregado",
    results,
  };
}

async function listAsignaciones(proyectoId) {
  if (!proyectoId) {
    const err = new Error("proyectoId es requerido");
    err.status = 400;
    throw err;
  }
  return repo.listAsignacionesByProyecto(proyectoId);
}
async function deleteProyecto(id) {
  await repo.deleteProyecto(id);
  return { status: "Eliminada" };
}

async function patchProyecto(id, payload = {}) {
  const pid = ensurePositiveInt(id, "id");
  const result = await repo.patchProyectoById(pid, payload);
  if (!result || result.affectedRows === 0) {
    const err = new Error("Proyecto no encontrado o sin cambios");
    err.status = 404;
    throw err;
  }
  return { status: "Actualización parcial exitosa", proyectoId: pid };
}

async function listEstadosProyecto() {
  return repo.listEstadoProyecto();
}

async function disponibilidad(query = {}) {
  const { fechaInicio, fechaFin, proyectoId, tipoEquipoId, cargoId } = query;
  if (!fechaInicio || !fechaFin) {
    const err = new Error("fechaInicio y fechaFin son requeridos");
    err.status = 400;
    throw err;
  }
  if (new Date(fechaFin) < new Date(fechaInicio)) {
    const err = new Error("fechaFin no puede ser menor a fechaInicio");
    err.status = 400;
    throw err;
  }
  const { empleados, equipos } = await repo.getDisponibilidad({
    fechaInicio,
    fechaFin,
    proyectoId,
    tipoEquipoId,
    cargoId,
  });

  // Normaliza nombres a los usados en endpoints existentes (empleados operativos / inventario equipos)
  const empleadosMapped = (empleados || []).map((e) => ({
    empleadoId: e.empleadoId,
    usuarioId: e.usuarioId,
    nombre: e.nombre,
    apellido: e.apellido,
    cargoId: e.cargoId,
    cargo: e.cargo,
    estadoId: e.estadoId,
    estado: e.estado,
    operativoCampo: !!e.operativoCampo,
    disponible: !!e.disponible,
    conflictos: e.conflictos || [],
  }));

  const equiposMapped = (equipos || []).map((eq) => ({
    idEquipo: eq.idEquipo,
    fechaIngreso: eq.fechaIngreso,
    idModelo: eq.idModelo,
    nombreModelo: eq.nombreModelo,
    idMarca: eq.idMarca,
    nombreMarca: eq.nombreMarca,
    idTipoEquipo: eq.idTipoEquipo,
    nombreTipoEquipo: eq.nombreTipoEquipo,
    idEstado: eq.idEstado,
    nombreEstado: eq.nombreEstado,
    serie: eq.serie,
    disponible: !!eq.disponible,
    conflictos: eq.conflictos || [],
  }));

  return { empleados: empleadosMapped, equipos: equiposMapped };
}

async function registrarDevolucion(proyectoId, payload = {}) {
  const pid = ensurePositiveInt(proyectoId, "proyectoId");
  const lista = Array.isArray(payload.devoluciones) ? payload.devoluciones : null;
  if (!lista || !lista.length) {
    const err = new Error("devoluciones es requerido y debe contener al menos un elemento");
    err.status = 400;
    throw err;
  }

  const allowedEstados = new Set(["devuelto", "daniado", "faltante"]);
  const results = [];

  for (let i = 0; i < lista.length; i++) {
    const item = lista[i] || {};
    const equipoId = ensurePositiveInt(item.equipoId, "equipoId");
    const estadoDevolucion =
      typeof item.estadoDevolucion === "string" ? item.estadoDevolucion.trim().toLowerCase() : null;
    if (!estadoDevolucion || !allowedEstados.has(estadoDevolucion)) {
      const err = new Error(
        `estadoDevolucion inválido para devoluciones[${i}]. Use devuelto | daniado | faltante`
      );
      err.status = 400;
      throw err;
    }
    const notas =
      typeof item.notas === "string" && item.notas.trim() ? item.notas.trim().slice(0, 255) : null;

    const asignacion = await repo.findAsignacionPendiente(pid, equipoId);
    if (!asignacion) {
      const err = new Error(
        `El equipo ${equipoId} no tiene una asignación pendiente de devolución en el proyecto ${pid}`
      );
      err.status = 404;
      throw err;
    }

    await repo.marcarDevolucion({
      proyectoId: pid,
      equipoId,
      estadoDevolucion,
      notas,
      usuarioId: null,
    });

    let nuevoEstado = null;
    let proyectosAfectados = [];

    if (estadoDevolucion === "daniado") {
      nuevoEstado = ESTADO_MANTENIMIENTO;
    } else if (estadoDevolucion === "faltante") {
      nuevoEstado = ESTADO_BAJA;
    }

    if (nuevoEstado) {
      const resp = await equipoService.updateEstado(equipoId, {
        idEstado: nuevoEstado,
        proyectoExcluidoId: pid, // no borres asignaciones del proyecto actual
      });
      proyectosAfectados = resp?.proyectosAfectados || [];
    }

    results.push({
      index: i,
      equipoId,
      estadoDevolucion,
      nuevoEstado,
      proyectosAfectados,
    });
  }

  return {
    status: "Devoluciones registradas",
    proyectoId: pid,
    results,
  };
}

module.exports = {
  listProyecto,
  findProyectoById,
  createProyecto,
  updateProyecto,
  addRecurso,
  listAsignaciones,
  deleteProyecto,
  patchProyecto,
  listEstadosProyecto,
  disponibilidad,
  registrarDevolucion,
};
