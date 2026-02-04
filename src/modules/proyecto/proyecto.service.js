const repo = require("./proyecto.repository");

function ensurePositiveInt(value, field) {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) {
    const err = new Error(`${field} es requerido y debe ser entero positivo`);
    err.status = 400;
    throw err;
  }
  return num;
}

function ensureArray(payload, field) {
  if (!Object.prototype.hasOwnProperty.call(payload || {}, field)) {
    const err = new Error(`${field} es requerido`);
    err.status = 400;
    throw err;
  }
  if (!Array.isArray(payload[field])) {
    const err = new Error(`${field} debe ser un arreglo`);
    err.status = 400;
    throw err;
  }
  return payload[field];
}

function toCleanText(value, maxLen = 255) {
  if (value == null) return null;
  const text = String(value).trim();
  if (!text) return null;
  return text.length > maxLen ? text.slice(0, maxLen) : text;
}

function normalizeTipoIncidencia(value) {
  const tipo = String(value || "").trim().toUpperCase();
  return tipo || null;
}

function normalizeFechaHoraEvento(value) {
  if (value == null || value === "") return null;
  const raw = String(value).trim();
  // Soporta: YYYY-MM-DD HH:mm, YYYY-MM-DD HH:mm:ss, YYYY-MM-DDTHH:mm, YYYY-MM-DDTHH:mm:ss
  const m = raw.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) {
    const err = new Error(
      "fechaHoraEvento debe tener formato YYYY-MM-DD HH:mm[:ss] o YYYY-MM-DDTHH:mm[:ss]"
    );
    err.status = 400;
    throw err;
  }
  const [, fecha, hh, mm, ss = "00"] = m;
  const [y, mo, da] = fecha.split("-").map(Number);
  const h = Number(hh);
  const mi = Number(mm);
  const se = Number(ss);
  const d = new Date(y, mo - 1, da, h, mi, se);
  if (
    Number.isNaN(d.getTime()) ||
    d.getFullYear() !== y ||
    d.getMonth() !== mo - 1 ||
    d.getDate() !== da ||
    d.getHours() !== h ||
    d.getMinutes() !== mi ||
    d.getSeconds() !== se
  ) {
    const err = new Error("fechaHoraEvento invalida");
    err.status = 400;
    throw err;
  }
  return `${fecha} ${hh}:${mm}:${ss}`;
}

/* Proyecto */
async function listProyecto() {
  return repo.getAllProyecto();
}
async function findProyectoById(id) {
  const data = await repo.getByIdProyecto(id);
  const row = data?.proyecto ?? (Array.isArray(data) ? data[0] : data);
  if (!row) {
    const err = new Error("Proyecto no encontrado");
    err.status = 404;
    throw err;
  }
  return {
    proyecto: row,
    dias: data?.dias || [],
    bloquesDia: data?.bloquesDia || [],
    serviciosDia: data?.serviciosDia || [],
    empleadosDia: data?.empleadosDia || [],
    equiposDia: data?.equiposDia || [],
    requerimientosPersonalDia: data?.requerimientosPersonalDia || [],
    requerimientosEquipoDia: data?.requerimientosEquipoDia || [],
    incidenciasDia: data?.incidenciasDia || [],
  };
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

  const result = await repo.postProyecto({
    pedidoId,
    responsableId: payload?.responsableId ?? null,
    notas: payload?.notas ?? null,
    enlace: payload?.enlace ?? null,
  });
  const first = Array.isArray(result) ? result[0] : result;
  return { status: "Registro exitoso", proyectoId: first?.proyectoId ?? null };
}
async function updateProyecto(id, payload) {
  await repo.putProyectoById(id, payload);
  return { status: "Actualización exitosa", proyectoId: Number(id) };
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

async function listEstadosProyectoDia() {
  return repo.listEstadoProyectoDia();
}

async function updateProyectoDiaEstado(diaId, estadoDiaId) {
  const did = ensurePositiveInt(diaId, "diaId");
  const eid = ensurePositiveInt(estadoDiaId, "estadoDiaId");

  const estados = await repo.listEstadoProyectoDia();
  const existe = Array.isArray(estados)
    ? estados.some((e) => Number(e.estadoDiaId) === eid)
    : false;
  if (!existe) {
    const err = new Error("estadoDiaId no valido");
    err.status = 400;
    throw err;
  }

  const result = await repo.updateProyectoDiaEstado(did, eid);
  if (!result || result.affectedRows === 0) {
    const err = new Error("Dia no encontrado o sin cambios");
    err.status = 404;
    throw err;
  }
  return { status: "Actualizacion exitosa", diaId: did, estadoDiaId: eid };
}

async function disponibilidadAsignaciones(query = {}) {
  const { fecha, fechaInicio, fechaFin, proyectoId, tipoEquipoId, cargoId } = query;
  const inicio = fecha || fechaInicio;
  const fin = fecha || fechaFin;
  if (!inicio || !fin) {
    const err = new Error("fecha es requerida (o fechaInicio y fechaFin)");
    err.status = 400;
    throw err;
  }
  if (new Date(fin) < new Date(inicio)) {
    const err = new Error("fechaFin no puede ser menor a fechaInicio");
    err.status = 400;
    throw err;
  }

  const { empleados, equipos } = await repo.getDisponibilidad({
    fechaInicio: inicio,
    fechaFin: fin,
    proyectoId,
    tipoEquipoId,
    cargoId,
  });

  const empleadosDisponibles = (empleados || [])
    .filter((e) => Number(e.disponible) === 1)
    .map((e) => ({
      empleadoId: e.empleadoId,
      usuarioId: e.usuarioId,
      nombre: e.nombre,
      apellido: e.apellido,
      cargoId: e.cargoId,
      cargo: e.cargo,
    }));

  const equiposDisponibles = (equipos || [])
    .filter((eq) => Number(eq.disponible) === 1)
    .map((eq) => ({
      equipoId: eq.idEquipo,
      serie: eq.serie,
      idModelo: eq.idModelo,
      nombreModelo: eq.nombreModelo,
      idTipoEquipo: eq.idTipoEquipo,
      nombreTipoEquipo: eq.nombreTipoEquipo,
    }));

  return { empleados: empleadosDisponibles, equipos: equiposDisponibles };
}

async function upsertProyectoAsignaciones(payload = {}) {
  const proyectoId = ensurePositiveInt(payload?.proyectoId, "proyectoId");
  const diasInput = ensureArray(payload, "dias");
  if (diasInput.length === 0) {
    const err = new Error("dias no puede estar vacio");
    err.status = 400;
    throw err;
  }

  const dias = diasInput.map((dia) => {
    const diaId = ensurePositiveInt(dia?.diaId, "diaId");
    const empleadosInput = ensureArray(dia, "empleados");
    const equiposInput = ensureArray(dia, "equipos");

    const empleados = empleadosInput.map((item) => ({
      empleadoId: ensurePositiveInt(item?.empleadoId, "empleadoId"),
      notas: toCleanText(item?.notas, 255),
    }));
    const empleadosSet = new Set(empleados.map((e) => e.empleadoId));

    const equipos = equiposInput.map((item) => ({
      equipoId: ensurePositiveInt(item?.equipoId, "equipoId"),
      responsableId:
        item?.responsableId == null
          ? null
          : empleadosSet.has(Number(item.responsableId))
          ? ensurePositiveInt(item.responsableId, "responsableId")
          : null,
      notas: toCleanText(item?.notas, 255),
    }));

    return { diaId, empleados, equipos };
  });

  const result = await repo.upsertProyectoAsignaciones(proyectoId, dias);
  return {
    status: "Actualizacion exitosa",
    proyectoId,
    dias: result?.dias ?? dias.length,
    empleados: result?.empleados ?? dias.reduce((s, d) => s + d.empleados.length, 0),
    equipos: result?.equipos ?? dias.reduce((s, d) => s + d.equipos.length, 0),
  };
}

async function createProyectoDiaIncidencia(diaId, payload = {}) {
  const did = ensurePositiveInt(diaId, "diaId");
  const tipo = normalizeTipoIncidencia(payload?.tipo);
  const descripcion = toCleanText(payload?.descripcion, 500);

  if (!tipo) {
    const err = new Error("tipo es requerido");
    err.status = 400;
    throw err;
  }
  if (!descripcion) {
    const err = new Error("descripcion es requerida");
    err.status = 400;
    throw err;
  }

  const empleadoId =
    payload?.empleadoId == null ? null : ensurePositiveInt(payload.empleadoId, "empleadoId");
  const empleadoReemplazoId =
    payload?.empleadoReemplazoId == null
      ? null
      : ensurePositiveInt(payload.empleadoReemplazoId, "empleadoReemplazoId");
  const equipoId =
    payload?.equipoId == null ? null : ensurePositiveInt(payload.equipoId, "equipoId");
  const equipoReemplazoId =
    payload?.equipoReemplazoId == null
      ? null
      : ensurePositiveInt(payload.equipoReemplazoId, "equipoReemplazoId");
  const fechaHoraEvento = normalizeFechaHoraEvento(payload?.fechaHoraEvento);

  const tiposValidos = new Set([
    "PERSONAL_NO_ASISTE",
    "EQUIPO_FALLA_EN_EVENTO",
    "EQUIPO_ROBO_PERDIDA",
    "OTROS",
  ]);
  if (!tiposValidos.has(tipo)) {
    const err = new Error("tipo no valido");
    err.status = 400;
    throw err;
  }

  if (tipo === "PERSONAL_NO_ASISTE") {
    if (!empleadoId || !empleadoReemplazoId) {
      const err = new Error("empleadoId y empleadoReemplazoId son requeridos");
      err.status = 400;
      throw err;
    }
  }
  if (tipo === "EQUIPO_FALLA_EN_EVENTO") {
    if (!equipoId || !equipoReemplazoId) {
      const err = new Error("equipoId y equipoReemplazoId son requeridos");
      err.status = 400;
      throw err;
    }
  }
  if (tipo === "EQUIPO_ROBO_PERDIDA") {
    if (!equipoId) {
      const err = new Error("equipoId es requerido para robo/perdida");
      err.status = 400;
      throw err;
    }
    // el reemplazo es opcional (puede que no haya uno disponible)
  }

  const result = await repo.createProyectoDiaIncidencia(did, {
    tipo,
    descripcion,
    empleadoId,
    empleadoReemplazoId,
    equipoId,
    equipoReemplazoId,
    fechaHoraEvento,
    usuarioId: payload?.usuarioId ?? null,
  });

  return {
    status: "Registro exitoso",
    incidenciaId: result?.incidenciaId ?? null,
    diaId: did,
    fechaHoraEvento,
  };
}

async function devolverEquiposDia(diaId, payload = {}) {
  const did = ensurePositiveInt(diaId, "diaId");
  const equiposInput = ensureArray(payload, "equipos");
  if (!equiposInput.length) {
    const err = new Error("equipos no puede estar vacio");
    err.status = 400;
    throw err;
  }
  const usuarioId =
    payload?.usuarioId == null ? null : ensurePositiveInt(payload.usuarioId, "usuarioId");
  const fechaGlobal =
    payload?.fechaDevolucion && String(payload.fechaDevolucion).toLowerCase() !== "auto"
      ? payload.fechaDevolucion
      : null;

  const estadosValidos = new Set(["DEVUELTO", "DANADO", "PERDIDO", "ROBADO"]);

  const equipos = equiposInput.map((e) => {
    const eqId = ensurePositiveInt(e?.equipoId, "equipoId");
    if (e?.devuelto === undefined) {
      const err = new Error("devuelto es requerido (0 o 1)");
      err.status = 400;
      throw err;
    }
    const devuelto = Number(e.devuelto) ? 1 : 0;
    const estadoDevRaw = toCleanText(e?.estadoDevolucion, 100);
    const estadoDev = estadoDevRaw ? estadoDevRaw.toUpperCase() : null;
    if (estadoDev && !estadosValidos.has(estadoDev)) {
      const err = new Error("estadoDevolucion no valido");
      err.status = 400;
      throw err;
    }
    const notasDev = toCleanText(e?.notasDevolucion, 255);
    const fechaDev =
      e?.fechaDevolucion && String(e.fechaDevolucion).toLowerCase() !== "auto"
        ? e.fechaDevolucion
        : fechaGlobal;
    return {
      equipoId: eqId,
      devuelto,
      estadoDevolucion: estadoDev,
      notasDevolucion: notasDev,
      fechaDevolucion: fechaDev,
    };
  });

  const result = await repo.updateDevolucionEquipos(did, equipos, usuarioId);
  return {
    status: "Devolucion registrada",
    diaId: did,
    equiposActualizados: result?.updated ?? equipos.length,
  };
}

async function devolverEquipo(diaId, equipoId, payload = {}) {
  const did = ensurePositiveInt(diaId, "diaId");
  const eqId = ensurePositiveInt(equipoId, "equipoId");
  const devueltoField = payload?.devuelto;
  if (devueltoField === undefined) {
    const err = new Error("devuelto es requerido (0 o 1)");
    err.status = 400;
    throw err;
  }
  const usuarioId =
    payload?.usuarioId == null ? null : ensurePositiveInt(payload.usuarioId, "usuarioId");

  const estadosValidos = new Set(["DEVUELTO", "DANADO", "PERDIDO", "ROBADO"]);
  const estadoDevRaw = toCleanText(payload?.estadoDevolucion, 100);
  const estadoDev = estadoDevRaw ? estadoDevRaw.toUpperCase() : null;
  if (estadoDev && !estadosValidos.has(estadoDev)) {
    const err = new Error("estadoDevolucion no valido");
    err.status = 400;
    throw err;
  }

  const item = {
    equipoId: eqId,
    devuelto: Number(devueltoField) ? 1 : 0,
    estadoDevolucion: estadoDev,
    notasDevolucion: toCleanText(payload?.notasDevolucion, 255),
    fechaDevolucion:
      payload?.fechaDevolucion && String(payload.fechaDevolucion).toLowerCase() !== "auto"
        ? payload.fechaDevolucion
        : null,
  };

  const result = await repo.updateDevolucionEquipos(did, [item], usuarioId);
  return {
    status: "Devolucion registrada",
    diaId: did,
    equiposActualizados: result?.updated ?? 1,
  };
}

module.exports = {
  listProyecto,
  findProyectoById,
  createProyecto,
  updateProyecto,
  deleteProyecto,
  patchProyecto,
  listEstadosProyecto,
  listEstadosProyectoDia,
  updateProyectoDiaEstado,
  disponibilidadAsignaciones,
  upsertProyectoAsignaciones,
  createProyectoDiaIncidencia,
  devolverEquiposDia,
  devolverEquipo,
};

