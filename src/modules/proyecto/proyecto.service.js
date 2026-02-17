const repo = require("./proyecto.repository");
const pagosService = require("../pagos/pagos.service");
const {
  ESTADOS_DEVOLUCION,
  ESTADOS_EQUIPO_OBJETIVO,
  CONSISTENCIA_DEVUELTO,
} = require("./devolucion.rules");

let devolucionWorkerStarted = false;
let devolucionWorkerBusy = false;
let devolucionWorkerTimer = null;

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

const CANCEL_RESPONSABLES = new Set(["CLIENTE", "INTERNO"]);
const CANCEL_MOTIVOS_POR_RESPONSABLE = {
  CLIENTE: new Set(["DESISTE_EVENTO", "FUERZA_MAYOR_CLIENTE", "OTRO_CLIENTE"]),
  INTERNO: new Set(["FUERZA_MAYOR_INTERNA", "OTRO_INTERNO"]),
};
const CANCEL_MOTIVOS_OTRO = new Set(["OTRO_CLIENTE", "OTRO_INTERNO"]);
const ESTADO_PAGO_CERRADO = "CERRADO";
const ESTADO_PEDIDO_CANCELADO = "CANCELADO";

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

function normalizeFechaBase(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    const err = new Error("fechaBase es requerida (YYYY-MM-DD)");
    err.status = 400;
    throw err;
  }

  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) {
    const err = new Error("fechaBase debe tener formato YYYY-MM-DD");
    err.status = 400;
    throw err;
  }

  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const parsed = new Date(y, mo - 1, d);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== y ||
    parsed.getMonth() !== mo - 1 ||
    parsed.getDate() !== d
  ) {
    const err = new Error("fechaBase invalida");
    err.status = 400;
    throw err;
  }
  return raw;
}

function tryParseJSON(value) {
  if (value == null) return null;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(String(value));
  } catch (_err) {
    return null;
  }
}

function normalizeUpper(value) {
  return String(value || "").trim().toUpperCase();
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function normalizeDevolucionPayload(payload = {}, { requireUsuarioId = false } = {}) {
  const equiposInput = ensureArray(payload, "equipos");
  if (!equiposInput.length) {
    const err = new Error("equipos no puede estar vacio");
    err.status = 400;
    throw err;
  }

  const usuarioId =
    payload?.usuarioId == null ? null : ensurePositiveInt(payload.usuarioId, "usuarioId");
  if (requireUsuarioId && usuarioId == null) {
    const err = new Error("usuarioId es requerido");
    err.status = 400;
    throw err;
  }

  const fechaGlobal =
    payload?.fechaDevolucion && String(payload.fechaDevolucion).toLowerCase() !== "auto"
      ? payload.fechaDevolucion
      : null;

  const estadosValidos = new Set(Object.values(ESTADOS_DEVOLUCION));
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
    if (!estadoDev) {
      const err = new Error("estadoDevolucion es requerido");
      err.status = 400;
      throw err;
    }
    if (!estadosValidos.has(estadoDev)) {
      const err = new Error("estadoDevolucion no valido");
      err.status = 400;
      throw err;
    }
    if (CONSISTENCIA_DEVUELTO[estadoDev] !== devuelto) {
      const err = new Error("estadoDevolucion y devuelto son inconsistentes");
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

  return {
    usuarioId,
    equipos,
    payloadNormalizado: {
      equipos,
      usuarioId,
      fechaDevolucion: fechaGlobal,
    },
  };
}

/* Proyecto */
async function listProyecto() {
  const rows = await repo.getAllProyecto();
  if (!Array.isArray(rows)) return rows;
  const pedidoIds = [
    ...new Set(
      rows
        .map((row) => Number(row?.pedidoId ?? 0))
        .filter((id) => Number.isInteger(id) && id > 0)
    ),
  ];
  const estados = await repo.getPedidosEstadosFinancierosByIds(pedidoIds);
  const estadosByPedidoId = new Map(estados.map((e) => [Number(e.pedidoId), e]));

  return rows.map((row) => {
    const pedidoId = Number(row?.pedidoId ?? 0);
    const est = estadosByPedidoId.get(pedidoId) || null;
    const estadoPagoNombre = est?.estadoPagoNombre ?? row?.estadoPagoNombre ?? null;
    const estadoPedidoNombre = est?.estadoPedidoNombre ?? null;
    const saldoBruto = toNumber(row?.saldoPendiente);
    const saldoNoEsCobrable =
      normalizeUpper(estadoPagoNombre) === ESTADO_PAGO_CERRADO ||
      normalizeUpper(estadoPedidoNombre) === ESTADO_PEDIDO_CANCELADO;

    const postproduccion = {
      fechaInicioEdicion: row.fechaInicioEdicion ?? null,
      fechaFinEdicion: row.fechaFinEdicion ?? null,
      preEntregaEnlace: row.preEntregaEnlace ?? null,
      preEntregaTipo: row.preEntregaTipo ?? null,
      preEntregaFeedback: row.preEntregaFeedback ?? null,
      preEntregaFecha: row.preEntregaFecha ?? null,
      respaldoUbicacion: row.respaldoUbicacion ?? null,
      respaldoNotas: row.respaldoNotas ?? null,
      entregaFinalEnlace: row.entregaFinalEnlace ?? null,
      entregaFinalFecha: row.entregaFinalFecha ?? null,
    };
    const proyecto = { ...row };
    delete proyecto.fechaInicioEdicion;
    delete proyecto.fechaFinEdicion;
    delete proyecto.preEntregaEnlace;
    delete proyecto.preEntregaTipo;
    delete proyecto.preEntregaFeedback;
    delete proyecto.preEntregaFecha;
    delete proyecto.respaldoUbicacion;
    delete proyecto.respaldoNotas;
    delete proyecto.entregaFinalEnlace;
    delete proyecto.entregaFinalFecha;
    proyecto.estadoPagoId = est?.estadoPagoId ?? row?.estadoPagoId ?? null;
    proyecto.estadoPagoNombre = estadoPagoNombre;
    proyecto.estadoPedidoId = est?.estadoPedidoId ?? null;
    proyecto.estadoPedidoNombre = estadoPedidoNombre;
    proyecto.saldoPendiente = saldoNoEsCobrable ? 0 : saldoBruto;
    proyecto.saldoNoCobrable = saldoNoEsCobrable ? saldoBruto : 0;
    return { ...proyecto, postproduccion };
  });
}
async function findProyectoById(id) {
  const data = await repo.getByIdProyecto(id);
  const row = data?.proyecto ?? (Array.isArray(data) ? data[0] : data);
  if (!row) {
    const err = new Error("Proyecto no encontrado");
    err.status = 404;
    throw err;
  }
  const postproduccion = {
    fechaInicioEdicion: row.fechaInicioEdicion ?? null,
    fechaFinEdicion: row.fechaFinEdicion ?? null,
    preEntregaEnlace: row.preEntregaEnlace ?? null,
    preEntregaTipo: row.preEntregaTipo ?? null,
    preEntregaFeedback: row.preEntregaFeedback ?? null,
    preEntregaFecha: row.preEntregaFecha ?? null,
    respaldoUbicacion: row.respaldoUbicacion ?? null,
    respaldoNotas: row.respaldoNotas ?? null,
    entregaFinalEnlace: row.entregaFinalEnlace ?? null,
    entregaFinalFecha: row.entregaFinalFecha ?? null,
  };
  const proyecto = { ...row };
  delete proyecto.fechaInicioEdicion;
  delete proyecto.fechaFinEdicion;
  delete proyecto.preEntregaEnlace;
  delete proyecto.preEntregaTipo;
  delete proyecto.preEntregaFeedback;
  delete proyecto.preEntregaFecha;
  delete proyecto.respaldoUbicacion;
  delete proyecto.respaldoNotas;
  delete proyecto.entregaFinalEnlace;
  delete proyecto.entregaFinalFecha;
  const pedidoId = Number(proyecto?.pedidoId ?? 0);
  if (pedidoId > 0) {
    try {
      const resumenPago = await pagosService.getResumen(pedidoId);
      proyecto.montoAbonado = toNumber(resumenPago?.MontoAbonado);
      proyecto.saldoPendiente = toNumber(resumenPago?.SaldoPendiente);
      proyecto.saldoNoCobrable = toNumber(resumenPago?.SaldoNoCobrable);
      proyecto.montoPorDevolver = toNumber(resumenPago?.MontoPorDevolver);
    } catch (_err) {
      // Mantener respuesta de proyecto aun si no se pudo obtener resumen de pagos.
    }
  }
  const diasNormalizados = (data?.dias || []).map((d) => ({
    ...d,
    cancelResponsable: d?.cancelResponsable ?? d?.PD_CancelResponsable ?? null,
    cancelMotivo: d?.cancelMotivo ?? d?.PD_CancelMotivo ?? null,
    cancelNotas: d?.cancelNotas ?? d?.PD_CancelNotas ?? null,
    cancelFecha: d?.cancelFecha ?? d?.PD_CancelFecha ?? null,
    ncRequerida: Number(d?.ncRequerida ?? d?.PD_NC_Requerida ?? 0),
    ncVoucherId: d?.ncVoucherId ?? d?.PD_NC_VoucherId ?? null,
    montoBase: d?.montoBase ?? d?.PD_MontoBase ?? null,
    igv: d?.igv ?? d?.PD_Igv ?? null,
    montoTotal: d?.montoTotal ?? d?.PD_MontoTotal ?? null,
  }));
  return {
    proyecto,
    postproduccion,
    dias: diasNormalizados,
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
  if (payload?.estadoId !== undefined) {
    const err = new Error(
      "estadoId no se puede actualizar manualmente en este endpoint"
    );
    err.status = 400;
    throw err;
  }
  const result = await repo.patchProyectoById(pid, payload);
  if (!result || result.affectedRows === 0) {
    const err = new Error("Proyecto no encontrado o sin cambios");
    err.status = 404;
    throw err;
  }
  return { status: "Actualización parcial exitosa", proyectoId: pid };
}

async function patchProyectoNombre(id, payload = {}) {
  const pid = ensurePositiveInt(id, "id");
  const proyectoNombre = String(payload?.proyectoNombre ?? "").trim();
  if (!proyectoNombre) {
    const err = new Error("proyectoNombre es requerido");
    err.status = 400;
    throw err;
  }
  const result = await repo.patchProyectoById(pid, { proyectoNombre });
  if (!result || result.affectedRows === 0) {
    const err = new Error("Proyecto no encontrado o sin cambios");
    err.status = 404;
    throw err;
  }
  return { status: "Nombre actualizado", proyectoId: pid, proyectoNombre };
}

async function patchProyectoPostproduccion(id, payload = {}) {
  async function getEstadoProyectoIdFlexible(...nombres) {
    let lastError = null;
    for (const nombre of nombres) {
      try {
        return await repo.getEstadoProyectoIdByNombre(nombre);
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError;
  }

  async function getEstadoPedidoIdFlexible(...nombres) {
    let lastError = null;
    for (const nombre of nombres) {
      try {
        return await repo.getEstadoPedidoIdByNombre(nombre);
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError;
  }

  const pid = ensurePositiveInt(id, "id");
  const clean = {
    fechaInicioEdicion: payload?.fechaInicioEdicion ?? undefined,
    fechaFinEdicion: payload?.fechaFinEdicion ?? undefined,
    preEntregaEnlace:
      payload?.preEntregaEnlace === undefined
        ? undefined
        : toCleanText(payload?.preEntregaEnlace, 255),
    preEntregaTipo:
      payload?.preEntregaTipo === undefined
        ? undefined
        : toCleanText(payload?.preEntregaTipo, 60),
    preEntregaFeedback:
      payload?.preEntregaFeedback === undefined
        ? undefined
        : toCleanText(payload?.preEntregaFeedback, 255),
    preEntregaFecha: payload?.preEntregaFecha ?? undefined,
    respaldoUbicacion:
      payload?.respaldoUbicacion === undefined
        ? undefined
        : toCleanText(payload?.respaldoUbicacion, 255),
    respaldoNotas:
      payload?.respaldoNotas === undefined
        ? undefined
        : toCleanText(payload?.respaldoNotas, 255),
    entregaFinalEnlace:
      payload?.entregaFinalEnlace === undefined
        ? undefined
        : toCleanText(payload?.entregaFinalEnlace, 255),
    entregaFinalFecha: payload?.entregaFinalFecha ?? undefined,
  };

  const result = await repo.patchProyectoById(pid, clean);
  if (!result || result.affectedRows === 0) {
    const err = new Error("Proyecto no encontrado o sin cambios");
    err.status = 404;
    throw err;
  }

  const current = await repo.getByIdProyecto(pid);
  const row = current?.proyecto ?? null;
  if (row) {
    const fechaFinEdicionSet = row.fechaFinEdicion != null;
    const respaldoUbicacionSet = String(row.respaldoUbicacion || "").trim().length > 0;
    const entregaFinalEnlaceSet = String(row.entregaFinalEnlace || "").trim().length > 0;
    const entregaFinalFechaSet = row.entregaFinalFecha != null;

    if (entregaFinalEnlaceSet && entregaFinalFechaSet) {
      const estadoEntregadoId = await getEstadoProyectoIdFlexible("Entregado");
      const estadoActualId = Number(row.estadoId || 0);
      if (estadoActualId !== estadoEntregadoId) {
        await repo.patchProyectoById(pid, { estadoId: estadoEntregadoId });
      }

      const info = await repo.getProyectoInfoByProyectoId(pid);
      if (info?.pedidoId) {
        const [
          estadoPedEntregadoId,
          estadoPedCotizadoId,
          estadoPedContratadoId,
          estadoPedEnEjecId,
        ] = await Promise.all([
          getEstadoPedidoIdFlexible("Entregado"),
          repo.getEstadoPedidoIdByNombre("Cotizado"),
          repo.getEstadoPedidoIdByNombre("Contratado"),
          getEstadoPedidoIdFlexible("En ejecución", "En ejecucion"),
        ]);

        const pedEstadoId = Number(info.pedidoEstadoId || 0);
        if (
          pedEstadoId !== estadoPedEntregadoId &&
          (pedEstadoId === estadoPedCotizadoId ||
            pedEstadoId === estadoPedContratadoId ||
            pedEstadoId === estadoPedEnEjecId)
        ) {
          await repo.updatePedidoEstadoById(info.pedidoId, estadoPedEntregadoId);
        }
      }
    } else if (fechaFinEdicionSet && respaldoUbicacionSet) {
      const [estadoPostId, estadoListoEntregaId] = await Promise.all([
        getEstadoProyectoIdFlexible("En postproduccion", "En postproducción"),
        getEstadoProyectoIdFlexible("Listo para entrega"),
      ]);
      const estadoActualId = Number(row.estadoId || 0);
      if (estadoActualId === estadoPostId) {
        await repo.patchProyectoById(pid, { estadoId: estadoListoEntregaId });
      }
    }
  }

  return { status: "Actualizacion postproduccion exitosa", proyectoId: pid };
}

async function listEstadosProyecto() {
  return repo.listEstadoProyecto();
}

async function listEstadosProyectoDia() {
  return repo.listEstadoProyectoDia();
}

async function updateProyectoDiaEstado(diaId, estadoDiaId) {
  async function getEstadoProyectoIdFlexible(...nombres) {
    let lastError = null;
    for (const nombre of nombres) {
      try {
        return await repo.getEstadoProyectoIdByNombre(nombre);
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError;
  }

  async function getEstadoPedidoIdFlexible(...nombres) {
    let lastError = null;
    for (const nombre of nombres) {
      try {
        return await repo.getEstadoPedidoIdByNombre(nombre);
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError;
  }

  const did = ensurePositiveInt(diaId, "diaId");
  const eid = ensurePositiveInt(estadoDiaId, "estadoDiaId");

  const estados = await repo.listEstadoProyectoDia();
  const estadoActual = Array.isArray(estados)
    ? estados.find((e) => Number(e.estadoDiaId) === eid)
    : null;
  const existe = !!estadoActual;
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

  // Regla: cuando el primer dia pasa a "En curso", mover proyecto y pedido a "En ejecucion"
  if (String(estadoActual?.estadoDiaNombre || "").trim().toLowerCase() === "en curso") {
    const info = await repo.getProyectoInfoByDiaId(did);
    if (info?.proyectoId) {
      const [
        estadoProyEnEjecId,
        estadoProyEntregadoId,
        estadoProyListoEntregaId,
        estadoPedEnEjecId,
        estadoPedCotizadoId,
        estadoPedContratadoId,
      ] = await Promise.all([
        getEstadoProyectoIdFlexible("En ejecucion", "En ejecución"),
        getEstadoProyectoIdFlexible("Entregado"),
        getEstadoProyectoIdFlexible("Listo para entrega"),
        getEstadoPedidoIdFlexible("En ejecución", "En ejecucion"),
        repo.getEstadoPedidoIdByNombre("Cotizado"),
        repo.getEstadoPedidoIdByNombre("Contratado"),
      ]);

      const proyEstadoId = Number(info.proyectoEstadoId);
      if (
        proyEstadoId !== estadoProyEnEjecId &&
        proyEstadoId !== estadoProyListoEntregaId &&
        proyEstadoId !== estadoProyEntregadoId
      ) {
        await repo.patchProyectoById(info.proyectoId, { estadoId: estadoProyEnEjecId });
      }

      if (info.pedidoId) {
        const pedEstadoId = Number(info.pedidoEstadoId);
        if (pedEstadoId === estadoPedCotizadoId || pedEstadoId === estadoPedContratadoId) {
          await repo.updatePedidoEstadoById(info.pedidoId, estadoPedEnEjecId);
        }
      }
    }
  }

  if (String(estadoActual?.estadoDiaNombre || "").trim().toLowerCase() === "terminado") {
    await tryAutoPostproduccionByDiaId(did);
  }

  return { status: "Actualizacion exitosa", diaId: did, estadoDiaId: eid };
}

async function cancelarDiaProyecto(diaId, payload = {}) {
  async function getEstadoProyectoIdFlexible(...nombres) {
    let lastError = null;
    for (const nombre of nombres) {
      try {
        return await repo.getEstadoProyectoIdByNombre(nombre);
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError;
  }

  async function getEstadoPedidoIdFlexible(...nombres) {
    let lastError = null;
    for (const nombre of nombres) {
      try {
        return await repo.getEstadoPedidoIdByNombre(nombre);
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError;
  }

  const did = ensurePositiveInt(diaId, "diaId");

  const responsable = String(payload?.responsable || "")
    .trim()
    .toUpperCase();
  if (!CANCEL_RESPONSABLES.has(responsable)) {
    const err = new Error("responsable invalido. Valores permitidos: CLIENTE, INTERNO");
    err.status = 400;
    throw err;
  }

  const motivo = String(payload?.motivo || "")
    .trim()
    .toUpperCase();
  const motivosValidos = CANCEL_MOTIVOS_POR_RESPONSABLE[responsable];
  if (!motivosValidos || !motivosValidos.has(motivo)) {
    const err = new Error(`motivo invalido para responsable ${responsable}`);
    err.status = 400;
    throw err;
  }

  const notas = toCleanText(payload?.notas, 500);
  if (CANCEL_MOTIVOS_OTRO.has(motivo) && (!notas || notas.length < 8)) {
    const err = new Error("notas debe tener al menos 8 caracteres para motivos OTRO_*");
    err.status = 400;
    throw err;
  }

  let estadoCanceladoId = null;
  try {
    estadoCanceladoId = await repo.getEstadoProyectoDiaIdByNombre("Cancelado");
  } catch (_err) {
    const err = new Error("No se encontro el estado de dia 'Cancelado'");
    err.status = 500;
    throw err;
  }

  const ncRequerida = responsable === "INTERNO" ? 1 : 0;
  const result = await repo.cancelProyectoDia(did, {
    estadoCanceladoId,
    responsable,
    motivo,
    notas,
    ncRequerida,
  });

  if (!result || result.affectedRows === 0) {
    const err = new Error("Dia no encontrado o sin cambios");
    err.status = 404;
    throw err;
  }

  let voucherId = null;
  if (responsable === "INTERNO") {
    const ctx = await repo.getProyectoDiaCancelContext(did);
    if (!ctx || !Number(ctx.pedidoId)) {
      const err = new Error("No se pudo resolver el pedido del dia cancelado");
      err.status = 500;
      throw err;
    }
    if (ctx.ncVoucherId != null) {
      const err = new Error("El dia ya tiene una nota de credito vinculada");
      err.status = 409;
      throw err;
    }

    const montoTotal = Number(ctx.montoTotal ?? 0);
    if (!Number.isFinite(montoTotal) || montoTotal <= 0) {
      const err = new Error("El monto total del dia es invalido para generar nota de credito");
      err.status = 400;
      throw err;
    }

    const metodoPagoId = await repo.getMetodoPagoIdByNombre("Transferencia");
    if (!metodoPagoId) {
      const err = new Error("No se encontro el metodo de pago 'Transferencia'");
      err.status = 500;
      throw err;
    }

    const out = await pagosService.createVoucher({
      pedidoId: Number(ctx.pedidoId),
      monto: Number((-montoTotal).toFixed(2)),
      metodoPagoId,
      estadoVoucherId: undefined,
      fecha: undefined,
      file: undefined,
    });
    voucherId = out?.voucherId != null ? Number(out.voucherId) : null;
    if (!voucherId) {
      const err = new Error("No se pudo generar voucher de nota de credito");
      err.status = 500;
      throw err;
    }

    const linked = await repo.setProyectoDiaNcVoucher(did, voucherId);
    if (!linked || linked.affectedRows === 0) {
      const err = new Error("No se pudo vincular la nota de credito al dia");
      err.status = 500;
      throw err;
    }
  }

  let proyectoCancelado = false;
  let pedidoCancelado = false;
  const info = await repo.getProyectoInfoByDiaId(did);
  if (info?.proyectoId) {
    const diasNoCancelados = await repo.countDiasNoCancelados(
      info.proyectoId,
      estadoCanceladoId
    );

    if (diasNoCancelados === 0) {
      const [estadoProyCanceladoId, estadoPedCanceladoId] = await Promise.all([
        getEstadoProyectoIdFlexible("Cancelado"),
        getEstadoPedidoIdFlexible("Cancelado"),
      ]);

      if (Number(info.proyectoEstadoId || 0) !== estadoProyCanceladoId) {
        await repo.patchProyectoById(info.proyectoId, { estadoId: estadoProyCanceladoId });
      }
      proyectoCancelado = true;

      if (info.pedidoId) {
        if (Number(info.pedidoEstadoId || 0) !== estadoPedCanceladoId) {
          await repo.updatePedidoEstadoById(info.pedidoId, estadoPedCanceladoId);
        }
        await pagosService.syncEstadoPagoPedidoById(info.pedidoId);
        pedidoCancelado = true;
      }
    }
  }

  return {
    status: "Dia cancelado",
    diaId: did,
    responsable,
    motivo,
    ncRequerida,
    voucherId,
    proyectoCancelado,
    pedidoCancelado,
  };
}

async function cancelarProyectoGlobal(proyectoId, payload = {}) {
  async function getEstadoProyectoIdFlexible(...nombres) {
    let lastError = null;
    for (const nombre of nombres) {
      try {
        return await repo.getEstadoProyectoIdByNombre(nombre);
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError;
  }

  async function getEstadoPedidoIdFlexible(...nombres) {
    let lastError = null;
    for (const nombre of nombres) {
      try {
        return await repo.getEstadoPedidoIdByNombre(nombre);
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError;
  }

  const pid = ensurePositiveInt(proyectoId, "proyectoId");

  const responsable = String(payload?.responsable || "")
    .trim()
    .toUpperCase();
  if (!CANCEL_RESPONSABLES.has(responsable)) {
    const err = new Error("responsable invalido. Valores permitidos: CLIENTE, INTERNO");
    err.status = 400;
    throw err;
  }

  const motivo = String(payload?.motivo || "")
    .trim()
    .toUpperCase();
  const motivosValidos = CANCEL_MOTIVOS_POR_RESPONSABLE[responsable];
  if (!motivosValidos || !motivosValidos.has(motivo)) {
    const err = new Error(`motivo invalido para responsable ${responsable}`);
    err.status = 400;
    throw err;
  }

  const notas = toCleanText(payload?.notas, 500);
  if (CANCEL_MOTIVOS_OTRO.has(motivo) && (!notas || notas.length < 8)) {
    const err = new Error("notas debe tener al menos 8 caracteres para motivos OTRO_*");
    err.status = 400;
    throw err;
  }

  const ctx = await repo.getProyectoCancelacionMasivaContext(pid);
  if (!ctx) {
    const err = new Error("Proyecto no encontrado");
    err.status = 404;
    throw err;
  }

  const totalDias = Number(ctx.totalDias || 0);
  if (totalDias <= 0) {
    const err = new Error("El proyecto no tiene dias para cancelar");
    err.status = 400;
    throw err;
  }

  if (Number(ctx.diasTerminados || 0) > 0) {
    const err = new Error(
      "No se puede hacer cancelacion global: existe al menos un dia Terminado"
    );
    err.status = 409;
    throw err;
  }

  if (Number(ctx.diasNoPermitidos || 0) > 0) {
    const err = new Error(
      "No se puede hacer cancelacion global: solo se permite cuando los dias estan en Pendiente, En curso o Cancelado"
    );
    err.status = 409;
    throw err;
  }

  let estadoCanceladoDiaId = null;
  try {
    estadoCanceladoDiaId = await repo.getEstadoProyectoDiaIdByNombre("Cancelado");
  } catch (_err) {
    const err = new Error("No se encontro el estado de dia 'Cancelado'");
    err.status = 500;
    throw err;
  }

  // Validar estados finales antes de aplicar cancelacion para evitar cambios parciales
  let estadoProyectoCanceladoId = null;
  let estadoPedidoCanceladoId = null;
  try {
    [estadoProyectoCanceladoId, estadoPedidoCanceladoId] = await Promise.all([
      getEstadoProyectoIdFlexible("Cancelado"),
      getEstadoPedidoIdFlexible("Cancelado"),
    ]);
  } catch (_err) {
    const err = new Error(
      "No se encontraron los estados 'Cancelado' requeridos para proyecto/pedido"
    );
    err.status = 500;
    throw err;
  }

  const ncRequerida = responsable === "INTERNO" ? 1 : 0;
  const cancelRes = await repo.cancelProyectoDiasMasivo(pid, {
    estadoCanceladoId: estadoCanceladoDiaId,
    responsable,
    motivo,
    notas,
    ncRequerida,
    estadoProyectoCanceladoId,
    estadoPedidoCanceladoId,
    pedidoId: ctx.pedidoId != null ? Number(ctx.pedidoId) : null,
  });

  let voucherId = null;
  if (responsable === "INTERNO" && Number(cancelRes.montoTotal || 0) > 0) {
    const pedidoId = Number(ctx.pedidoId || 0);
    if (!pedidoId) {
      const err = new Error("No se pudo resolver el pedido del proyecto");
      err.status = 500;
      throw err;
    }

    const metodoPagoId = await repo.getMetodoPagoIdByNombre("Transferencia");
    if (!metodoPagoId) {
      const err = new Error("No se encontro el metodo de pago 'Transferencia'");
      err.status = 500;
      throw err;
    }

    const out = await pagosService.createVoucher({
      pedidoId,
      monto: Number((-Number(cancelRes.montoTotal)).toFixed(2)),
      metodoPagoId,
      estadoVoucherId: undefined,
      fecha: undefined,
      file: undefined,
    });
    voucherId = out?.voucherId != null ? Number(out.voucherId) : null;
    if (!voucherId) {
      const err = new Error("No se pudo generar voucher de nota de credito");
      err.status = 500;
      throw err;
    }

    if (Array.isArray(cancelRes.diaIds) && cancelRes.diaIds.length > 0) {
      await repo.setProyectoDiasNcVoucherByIds(cancelRes.diaIds, voucherId);
    }
  }

  if (ctx.pedidoId != null) {
    await pagosService.syncEstadoPagoPedidoById(ctx.pedidoId);
  }

  return {
    status: "Proyecto cancelado globalmente",
    proyectoId: pid,
    pedidoId: ctx.pedidoId != null ? Number(ctx.pedidoId) : null,
    responsable,
    motivo,
    ncRequerida,
    voucherId,
    diasTotales: totalDias,
    diasCanceladosOperacion: Number(cancelRes.affectedRows || 0),
    diasYaCancelados: Number(ctx.diasCancelados || 0),
    montoNcTotal: Number(cancelRes.montoTotal || 0),
    proyectoCancelado: true,
    pedidoCancelado: ctx.pedidoId != null,
  };
}

async function tryAutoPostproduccionByDiaId(diaId) {
  const info = await repo.getProyectoInfoByDiaId(diaId);
  if (!info?.proyectoId) return;

  const [estadoDiaTerminadoId, estadoProyPostId] = await Promise.all([
    repo.getEstadoProyectoDiaIdByNombre("Terminado"),
    repo.getEstadoProyectoIdByNombre("En postproduccion"),
  ]);

  const diasNoTerminados = await repo.countDiasNoTerminados(
    info.proyectoId,
    estadoDiaTerminadoId
  );
  if (diasNoTerminados > 0) return;

  const equiposNoDevueltos = await repo.countEquiposNoDevueltos(info.proyectoId);
  if (equiposNoDevueltos > 0) return;

  const estadoActual = Number(info.proyectoEstadoId);
  if (estadoActual === estadoProyPostId) return;

  await repo.patchProyectoById(info.proyectoId, { estadoId: estadoProyPostId });
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
  const { usuarioId, equipos } = normalizeDevolucionPayload(payload);

  const result = await repo.updateDevolucionEquipos(did, equipos, usuarioId);
  await tryAutoPostproduccionByDiaId(did);
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

  const estadosValidos = new Set(Object.values(ESTADOS_DEVOLUCION));
  const estadoDevRaw = toCleanText(payload?.estadoDevolucion, 100);
  const estadoDev = estadoDevRaw ? estadoDevRaw.toUpperCase() : null;
  if (!estadoDev) {
    const err = new Error("estadoDevolucion es requerido");
    err.status = 400;
    throw err;
  }
  if (estadoDev && !estadosValidos.has(estadoDev)) {
    const err = new Error("estadoDevolucion no valido");
    err.status = 400;
    throw err;
  }
  const devuelto = Number(devueltoField) ? 1 : 0;
  if (CONSISTENCIA_DEVUELTO[estadoDev] !== devuelto) {
    const err = new Error("estadoDevolucion y devuelto son inconsistentes");
    err.status = 400;
    throw err;
  }

  const item = {
    equipoId: eqId,
    devuelto,
    estadoDevolucion: estadoDev,
    notasDevolucion: toCleanText(payload?.notasDevolucion, 255),
    fechaDevolucion:
      payload?.fechaDevolucion && String(payload.fechaDevolucion).toLowerCase() !== "auto"
        ? payload.fechaDevolucion
        : null,
  };

  const result = await repo.updateDevolucionEquipos(did, [item], usuarioId);
  await tryAutoPostproduccionByDiaId(did);
  return {
    status: "Devolucion registrada",
    diaId: did,
    equiposActualizados: result?.updated ?? 1,
  };
}

async function processOneDevolucionJobTick() {
  if (devolucionWorkerBusy) return;
  devolucionWorkerBusy = true;
  try {
    const job = await repo.claimNextPendingDevolucionJob();
    if (!job) return;

    const payload = tryParseJSON(job.requestJson);
    if (!payload || typeof payload !== "object") {
      await repo.failDevolucionJob(job.internalId, "Payload del job invalido");
      return;
    }

    try {
      const result = await devolverEquiposDia(job.diaId, payload);
      await repo.completeDevolucionJob(job.internalId, result);
    } catch (err) {
      await repo.failDevolucionJob(job.internalId, err?.message || "Error al procesar job");
    }
  } finally {
    devolucionWorkerBusy = false;
  }
}

function startDevolucionJobWorker() {
  if (devolucionWorkerStarted) return;
  devolucionWorkerStarted = true;
  repo.ensureDevolucionJobTable().catch(() => {});
  devolucionWorkerTimer = setInterval(() => {
    processOneDevolucionJobTick().catch(() => {});
  }, 1000);
  if (devolucionWorkerTimer?.unref) devolucionWorkerTimer.unref();
  processOneDevolucionJobTick().catch(() => {});
}

async function enqueueDevolucionEquiposDia(diaId, payload = {}) {
  const did = ensurePositiveInt(diaId, "diaId");
  const { payloadNormalizado, usuarioId } = normalizeDevolucionPayload(payload);
  startDevolucionJobWorker();
  const created = await repo.createDevolucionJob(did, payloadNormalizado, usuarioId);
  return {
    status: "Aceptado",
    jobId: created.jobId,
    diaId: did,
  };
}

async function getDevolucionJobStatus(jobId) {
  const id = String(jobId || "").trim();
  if (!id) {
    const err = new Error("jobId es requerido");
    err.status = 400;
    throw err;
  }
  const job = await repo.getDevolucionJobById(id);
  if (!job) {
    const err = new Error("Job no encontrado");
    err.status = 404;
    throw err;
  }
  return {
    jobId: job.jobId,
    estado: job.estado,
    diaId: Number(job.diaId),
    usuarioId: job.usuarioId == null ? null : Number(job.usuarioId),
    intentos: Number(job.intentos || 0),
    error: job.error || null,
    createdAt: job.createdAt || null,
    startedAt: job.startedAt || null,
    completedAt: job.completedAt || null,
    result: tryParseJSON(job.resultJson),
  };
}

async function previewDevolucionEquipo(payload = {}) {
  async function buildSinglePreview(item = {}, idx = null, fechaBaseGlobal = null) {
    const suf = idx == null ? "" : `[${idx}]`;
    const equipoId = ensurePositiveInt(item?.equipoId, `equipos${suf}.equipoId`);
    const estadoDevRaw = toCleanText(item?.estadoDevolucion, 100);
    const estadoDevolucion = estadoDevRaw ? estadoDevRaw.toUpperCase() : null;
    const diaId =
      item?.diaId == null ? null : ensurePositiveInt(item.diaId, `equipos${suf}.diaId`);
    let fechaBaseRaw = null;
    if (diaId != null) {
      const dia = await repo.getProyectoDiaFechaById(diaId);
      if (!dia?.fecha) {
        const err = new Error(`equipos${suf}.diaId no encontrado`);
        err.status = 404;
        throw err;
      }
      fechaBaseRaw = dia.fecha;
    } else {
      fechaBaseRaw = item?.fechaBase ?? fechaBaseGlobal ?? null;
    }
    const fechaBase = normalizeFechaBase(fechaBaseRaw);

    const estadosValidos = new Set(Object.values(ESTADOS_DEVOLUCION));
    if (!estadoDevolucion) {
      const err = new Error(`equipos${suf}.estadoDevolucion es requerido`);
      err.status = 400;
      throw err;
    }
    if (!estadosValidos.has(estadoDevolucion)) {
      const err = new Error(`equipos${suf}.estadoDevolucion no valido`);
      err.status = 400;
      throw err;
    }

    const estadoEquipoObjetivo = ESTADOS_EQUIPO_OBJETIVO[estadoDevolucion];
    const aplicaDesasignacion = estadoEquipoObjetivo !== "Disponible";
    const motivo = aplicaDesasignacion
      ? `Devolucion ${estadoDevolucion}: equipo pasa a ${estadoEquipoObjetivo} y se desasigna desde el dia siguiente.`
      : `Devolucion ${estadoDevolucion}: equipo queda en ${estadoEquipoObjetivo}; no aplica desasignacion automatica.`;

    const { equipo, impacto } = await repo.previewDevolucionEquipo({
      equipoId,
      fechaBase,
      diaId,
    });

    const impactoAplicable = aplicaDesasignacion ? impacto : [];
    const proyectosMap = new Map();
    const diasClave = new Set();
    for (const row of impactoAplicable) {
      const proyectoId = Number(row.proyectoId);
      const diaKey = `${proyectoId}:${Number(row.diaId)}`;
      diasClave.add(diaKey);
      if (!proyectosMap.has(proyectoId)) {
        proyectosMap.set(proyectoId, {
          proyectoId,
          proyectoNombre: row.proyectoNombre ?? null,
          diasAfectados: 0,
          cantidadDesasignaciones: 0,
        });
      }
      const proyecto = proyectosMap.get(proyectoId);
      proyecto.cantidadDesasignaciones += 1;
    }
    for (const diaKey of diasClave) {
      const [proyectoIdRaw] = diaKey.split(":");
      const proyecto = proyectosMap.get(Number(proyectoIdRaw));
      if (proyecto) proyecto.diasAfectados += 1;
    }

    return {
      equipo: {
        equipoId: Number(equipo.equipoId),
        serie: equipo.serie ?? null,
        modeloId: equipo.modeloId ?? null,
        modeloNombre: equipo.modeloNombre ?? null,
        tipoEquipoId: equipo.tipoEquipoId ?? null,
        tipoEquipoNombre: equipo.tipoEquipoNombre ?? null,
      },
      estadoDevolucion,
      estadoEquipoObjetivo,
      fechaBase,
      regla: "desasignar solo desde el dia siguiente en adelante",
      aplicaDesasignacion,
      motivo,
      cantidadDesasignaciones: impactoAplicable.length,
      diasAfectados: impactoAplicable.map((row) => ({
        diaId: Number(row.diaId),
        fecha: row.fecha,
        proyectoId: Number(row.proyectoId),
        proyectoNombre: row.proyectoNombre ?? null,
      })),
      proyectosAfectados: Array.from(proyectosMap.values()),
    };
  }

  if (Array.isArray(payload?.equipos)) {
    if (!payload.equipos.length) {
      const err = new Error("equipos no puede estar vacio");
      err.status = 400;
      throw err;
    }
    const fechaBaseGlobal = payload?.fechaBase ?? null;
    const simulaciones = [];
    for (let i = 0; i < payload.equipos.length; i += 1) {
      // Secuencial para conservar trazabilidad de error por indice.
      const simulacion = await buildSinglePreview(payload.equipos[i], i, fechaBaseGlobal);
      simulaciones.push(simulacion);
    }

    const resumen = {
      cantidadEquipos: simulaciones.length,
      cantidadDesasignaciones: simulaciones.reduce(
        (acc, s) => acc + Number(s.cantidadDesasignaciones || 0),
        0
      ),
      proyectosAfectadosUnicos: 0,
      diasAfectadosUnicos: 0,
    };
    const proyectosSet = new Set();
    const diasSet = new Set();
    for (const sim of simulaciones) {
      for (const p of sim.proyectosAfectados || []) {
        proyectosSet.add(Number(p.proyectoId));
      }
      for (const d of sim.diasAfectados || []) {
        diasSet.add(`${Number(d.proyectoId)}:${Number(d.diaId)}`);
      }
    }
    resumen.proyectosAfectadosUnicos = proyectosSet.size;
    resumen.diasAfectadosUnicos = diasSet.size;

    return {
      status: "Preview generado",
      simulaciones,
      resumen,
    };
  }

  // Compatibilidad con payload unitario existente.
  const simulacion = await buildSinglePreview(payload, null, null);
  return {
    status: "Preview generado",
    simulacion,
  };
}

module.exports = {
  listProyecto,
  findProyectoById,
  createProyecto,
  updateProyecto,
  deleteProyecto,
  patchProyecto,
  patchProyectoNombre,
  patchProyectoPostproduccion,
  listEstadosProyecto,
  listEstadosProyectoDia,
  updateProyectoDiaEstado,
  cancelarDiaProyecto,
  cancelarProyectoGlobal,
  disponibilidadAsignaciones,
  upsertProyectoAsignaciones,
  createProyectoDiaIncidencia,
  devolverEquiposDia,
  devolverEquipo,
  enqueueDevolucionEquiposDia,
  getDevolucionJobStatus,
  startDevolucionJobWorker,
  previewDevolucionEquipo,
};





