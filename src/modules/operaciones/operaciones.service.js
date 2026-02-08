const repo = require("./operaciones.repository");
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function formatYmd(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildTargetDates() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return {
    hoy: formatYmd(today),
    manana: formatYmd(tomorrow),
  };
}

function toPercent(part, total) {
  const p = Number(part || 0);
  const t = Number(total || 0);
  if (!t) return 0;
  return Number(((p * 100) / t).toFixed(2));
}

function assert(cond, message, status = 400) {
  if (!cond) {
    const err = new Error(message);
    err.status = status;
    throw err;
  }
}

function parseDateRange(query = {}) {
  const { from, to } = query;
  const today = new Date();
  const startDefault = new Date(today.getFullYear(), today.getMonth(), 1);
  const endDefault = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const fromYmd = from ? String(from).trim() : formatYmd(startDefault);
  const toYmd = to ? String(to).trim() : formatYmd(endDefault);

  assert(ISO_DATE.test(fromYmd), "Parametro 'from' debe ser YYYY-MM-DD");
  assert(ISO_DATE.test(toYmd), "Parametro 'to' debe ser YYYY-MM-DD");
  assert(fromYmd <= toYmd, "Parametro 'from' no puede ser mayor que 'to'");
  return { fromYmd, toYmd };
}

function buildResumenPorFecha({ proyectoDias, pedidoEventos }) {
  const map = new Map();
  const ensure = (fecha) => {
    if (!map.has(fecha)) {
      map.set(fecha, {
        fecha,
        totalProyectoDias: 0,
        totalProyectosUnicos: 0,
        totalPedidosEventos: 0,
        totalPedidosUnicos: 0,
      });
    }
    return map.get(fecha);
  };

  const proyectosSetPorFecha = new Map();
  const pedidosSetPorFecha = new Map();

  for (const d of proyectoDias || []) {
    const row = ensure(d.fecha);
    row.totalProyectoDias += 1;
    if (!proyectosSetPorFecha.has(d.fecha)) proyectosSetPorFecha.set(d.fecha, new Set());
    proyectosSetPorFecha.get(d.fecha).add(Number(d.proyectoId));
  }

  for (const e of pedidoEventos || []) {
    const row = ensure(e.fecha);
    row.totalPedidosEventos += 1;
    if (!pedidosSetPorFecha.has(e.fecha)) pedidosSetPorFecha.set(e.fecha, new Set());
    pedidosSetPorFecha.get(e.fecha).add(Number(e.pedidoId));
  }

  for (const [fecha, row] of map.entries()) {
    row.totalProyectosUnicos = (proyectosSetPorFecha.get(fecha) || new Set()).size;
    row.totalPedidosUnicos = (pedidosSetPorFecha.get(fecha) || new Set()).size;
  }

  return Array.from(map.values()).sort((a, b) => a.fecha.localeCompare(b.fecha));
}

function attachBloquesToDias(dias, bloques) {
  const map = new Map();
  for (const b of bloques || []) {
    const key = Number(b.diaId);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push({
      bloqueId: Number(b.bloqueId),
      hora: b.hora,
      ubicacion: b.ubicacion,
      direccion: b.direccion,
      notas: b.notas,
      orden: Number(b.orden || 0),
    });
  }
  return (dias || []).map((d) => ({
    ...d,
    bloques: map.get(Number(d.diaId)) || [],
  }));
}

function iterateYmdRange(fromYmd, toYmd) {
  const out = [];
  const from = new Date(`${fromYmd}T00:00:00`);
  const to = new Date(`${toYmd}T00:00:00`);
  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    out.push(formatYmd(d));
  }
  return out;
}

function toCapacityRow(fecha, staffUsage, equipoUsage, totals) {
  const staffTotal = Number(totals.staffTotal || 0);
  const equipoTotal = Number(totals.equipoTotal || 0);

  const staffUsado = Number(staffUsage?.staffUnicoAsignado || 0);
  const equipoUsado = Number(equipoUsage?.equipoUnicoAsignado || 0);

  const staffPct = staffTotal ? Number(((staffUsado * 100) / staffTotal).toFixed(2)) : 0;
  const equipoPct = equipoTotal ? Number(((equipoUsado * 100) / equipoTotal).toFixed(2)) : 0;

  return {
    fecha,
    staff: {
      capacidadTotal: staffTotal,
      usado: staffUsado,
      libre: Math.max(staffTotal - staffUsado, 0),
      saturacionPct: staffPct,
      asignaciones: Number(staffUsage?.asignacionesStaff || 0),
      sobreasignado: staffUsado > staffTotal,
    },
    equipo: {
      capacidadTotal: equipoTotal,
      usado: equipoUsado,
      libre: Math.max(equipoTotal - equipoUsado, 0),
      saturacionPct: equipoPct,
      asignaciones: Number(equipoUsage?.asignacionesEquipo || 0),
      pendientesDevolucion: Number(equipoUsage?.equipoPendienteDevolucion || 0),
      sobreasignado: equipoUsado > equipoTotal,
    },
  };
}

async function buildProyectosDelDia(fechaYmd) {
  const [resumen, porEstadoDia, proyectos] = await Promise.all([
    repo.getProyectosDiaResumen(fechaYmd),
    repo.listProyectosDiaPorEstado(fechaYmd),
    repo.listProyectosDiaDetalle(fechaYmd),
  ]);

  return {
    fecha: fechaYmd,
    totalProyectos: Number(resumen.totalProyectos || 0),
    totalDias: Number(resumen.totalDias || 0),
    porEstadoDia: (porEstadoDia || []).map((r) => ({
      id: Number(r.id),
      nombre: r.nombre,
      total: Number(r.total || 0),
    })),
    proyectos: Array.isArray(proyectos) ? proyectos : [],
  };
}

async function getKpisOperativosMinimos() {
  const { hoy, manana } = buildTargetDates();

  const [
    pedidosPorEstado,
    proyectosPorEstado,
    cotizacionesPorEstado,
    embudoCoreCounts,
    antiguedadCotizacionSinPedido,
    antiguedadPedidoSinProyecto,
    antiguedadProyectoActivo,
    cuellosCotizaciones,
    cuellosPedidos,
    cuellosProyectos,
    proyectosHoy,
    proyectosManana,
    devolucionesCount,
    devolucionesItems,
    suspendidosCanceladosCount,
    suspendidosCanceladosItems,
    retrasosCount,
    retrasosItems,
  ] = await Promise.all([
    repo.listPedidosPorEstado(),
    repo.listProyectosPorEstado(),
    repo.listCotizacionesPorEstado(),
    repo.getEmbudoCoreCounts(),
    repo.getAntiguedadFaseCotizacionSinPedido(),
    repo.getAntiguedadFasePedidoSinProyecto(),
    repo.getAntiguedadFaseProyectoActivo(),
    repo.listCuellosBotellaCotizaciones(),
    repo.listCuellosBotellaPedidos(),
    repo.listCuellosBotellaProyectos(),
    buildProyectosDelDia(hoy),
    buildProyectosDelDia(manana),
    repo.getAlertaDevolucionesPendientesCount(),
    repo.listAlertaDevolucionesPendientes(),
    repo.getAlertaDiasSuspendidosCanceladosCount(),
    repo.listAlertaDiasSuspendidosCancelados(),
    repo.getAlertaRetrasosCount(),
    repo.listAlertaRetrasos(),
  ]);

  const embudo = {
    cotizacionesTotal: Number(embudoCoreCounts.cotizacionesTotal || 0),
    pedidosTotal: Number(embudoCoreCounts.pedidosTotal || 0),
    proyectosTotal: Number(embudoCoreCounts.proyectosTotal || 0),
    cotizacionesConPedido: Number(embudoCoreCounts.cotizacionesConPedido || 0),
    pedidosConProyecto: Number(embudoCoreCounts.pedidosConProyecto || 0),
    cotizacionesConProyectoFinal: Number(
      embudoCoreCounts.cotizacionesConProyectoFinal || 0
    ),
  };

  return {
    generatedAt: new Date().toISOString(),
    kpis: {
      cotizacionesPorEstado: (cotizacionesPorEstado || []).map((r) => ({
        id: Number(r.id),
        nombre: r.nombre,
        total: Number(r.total || 0),
      })),
      pedidosPorEstado: (pedidosPorEstado || []).map((r) => ({
        id: Number(r.id),
        nombre: r.nombre,
        total: Number(r.total || 0),
      })),
      proyectosPorEstado: (proyectosPorEstado || []).map((r) => ({
        id: Number(r.id),
        nombre: r.nombre,
        total: Number(r.total || 0),
      })),
      embudoCore: {
        ...embudo,
        conversiones: {
          cotizacionAPedidoPct: toPercent(
            embudo.cotizacionesConPedido,
            embudo.cotizacionesTotal
          ),
          pedidoAProyectoPct: toPercent(
            embudo.pedidosConProyecto,
            embudo.pedidosTotal
          ),
          cotizacionAProyectoPct: toPercent(
            embudo.cotizacionesConProyectoFinal,
            embudo.cotizacionesTotal
          ),
        },
      },
      antiguedadFases: {
        cotizacionSinPedido: {
          total: Number(antiguedadCotizacionSinPedido.total || 0),
          promedioDias: Number(antiguedadCotizacionSinPedido.promedioDias || 0),
          maxDias: Number(antiguedadCotizacionSinPedido.maxDias || 0),
        },
        pedidoSinProyecto: {
          total: Number(antiguedadPedidoSinProyecto.total || 0),
          promedioDias: Number(antiguedadPedidoSinProyecto.promedioDias || 0),
          maxDias: Number(antiguedadPedidoSinProyecto.maxDias || 0),
        },
        proyectoActivoNoEntregado: {
          total: Number(antiguedadProyectoActivo.total || 0),
          promedioDias: Number(antiguedadProyectoActivo.promedioDias || 0),
          maxDias: Number(antiguedadProyectoActivo.maxDias || 0),
        },
      },
      proyectosDelDia: {
        hoy: proyectosHoy,
        manana: proyectosManana,
      },
      alertas: {
        devolucionesPendientes: {
          totalEquiposPendientes: Number(
            devolucionesCount.totalEquiposPendientes || 0
          ),
          totalDiasConPendientes: Number(
            devolucionesCount.totalDiasConPendientes || 0
          ),
          items: Array.isArray(devolucionesItems) ? devolucionesItems : [],
        },
        diasSuspendidosCancelados: {
          totalDias: Number(suspendidosCanceladosCount.totalDias || 0),
          items: Array.isArray(suspendidosCanceladosItems)
            ? suspendidosCanceladosItems
            : [],
        },
        retrasos: {
          totalDias: Number(retrasosCount.totalDias || 0),
          items: Array.isArray(retrasosItems) ? retrasosItems : [],
        },
        cuellosBotella: {
          cotizacionesSinPedido: Array.isArray(cuellosCotizaciones)
            ? cuellosCotizaciones
            : [],
          pedidosSinProyecto: Array.isArray(cuellosPedidos)
            ? cuellosPedidos
            : [],
          proyectosNoEntregados: Array.isArray(cuellosProyectos)
            ? cuellosProyectos
            : [],
        },
      },
    },
  };
}

async function getAgendaOperativa(query = {}) {
  const { fromYmd, toYmd } = parseDateRange(query);

  const [proyectoDiasRaw, pedidoEventosRaw] = await Promise.all([
    repo.listAgendaProyectoDias(fromYmd, toYmd),
    repo.listAgendaPedidosEventos(fromYmd, toYmd),
  ]);

  const diaIds = (proyectoDiasRaw || []).map((d) => Number(d.diaId));
  const bloques = await repo.listAgendaBloquesByDiaIds(diaIds);
  const proyectoDias = attachBloquesToDias(proyectoDiasRaw, bloques);

  const pedidoEventos = (pedidoEventosRaw || []).map((r) => ({
    pedidoEventoId: Number(r.pedidoEventoId),
    pedidoId: Number(r.pedidoId),
    pedido: r.pedido,
    fecha: r.fecha,
    hora: r.hora,
    ubicacion: r.ubicacion,
    direccion: r.direccion,
    notas: r.notas,
    estadoPedidoId: r.estadoPedidoId != null ? Number(r.estadoPedidoId) : null,
    estadoPedido: r.estadoPedido,
    proyectoIdVinculado:
      r.proyectoIdVinculado != null ? Number(r.proyectoIdVinculado) : null,
  }));

  const proyectoDiasAdaptados = (proyectoDias || []).map((d) => ({
    diaId: Number(d.diaId),
    fecha: d.fecha,
    proyectoId: Number(d.proyectoId),
    proyecto: d.proyecto,
    estadoDiaId: d.estadoDiaId != null ? Number(d.estadoDiaId) : null,
    estadoDia: d.estadoDia,
    estadoProyectoId:
      d.estadoProyectoId != null ? Number(d.estadoProyectoId) : null,
    estadoProyecto: d.estadoProyecto,
    pedidoId: d.pedidoId != null ? Number(d.pedidoId) : null,
    pedido: d.pedido,
    estadoPedidoId: d.estadoPedidoId != null ? Number(d.estadoPedidoId) : null,
    estadoPedido: d.estadoPedido,
    totalBloques: Number(d.totalBloques || 0),
    totalEmpleados: Number(d.totalEmpleados || 0),
    totalEquipos: Number(d.totalEquipos || 0),
    totalEquiposPendientes: Number(d.totalEquiposPendientes || 0),
    bloques: Array.isArray(d.bloques) ? d.bloques : [],
  }));

  return {
    generatedAt: new Date().toISOString(),
    range: {
      from: fromYmd,
      to: toYmd,
    },
    resumenPorFecha: buildResumenPorFecha({
      proyectoDias: proyectoDiasAdaptados,
      pedidoEventos,
    }),
    agenda: {
      proyectoDias: proyectoDiasAdaptados,
      pedidoEventos,
    },
  };
}

async function getDashboardResumen() {
  const { hoy, manana } = buildTargetDates();

  const [
    cotizacionesPorEstado,
    pedidosPorEstado,
    proyectosPorEstado,
    embudoCoreCounts,
    cotizacionSinPedido,
    pedidoSinProyecto,
    proyectoActivoNoEntregado,
    proyectosHoy,
    proyectosManana,
    devolucionesCount,
    suspendidosPorReprogramarCount,
    listoSinLinkFinalCount,
  ] = await Promise.all([
    repo.listCotizacionesPorEstado(),
    repo.listPedidosPorEstado(),
    repo.listProyectosPorEstado(),
    repo.getEmbudoCoreCounts(),
    repo.getAntiguedadFaseCotizacionSinPedido(),
    repo.getAntiguedadFasePedidoSinProyecto(),
    repo.getAntiguedadFaseProyectoActivo(),
    repo.getProyectosDiaResumen(hoy),
    repo.getProyectosDiaResumen(manana),
    repo.getAlertaDevolucionesPendientesCount(),
    repo.getAlertaDiasSuspendidosPorReprogramarCount(),
    repo.getAlertaProyectoListoSinLinkFinalCount(),
  ]);

  const embudo = {
    cotizacionesTotal: Number(embudoCoreCounts.cotizacionesTotal || 0),
    pedidosTotal: Number(embudoCoreCounts.pedidosTotal || 0),
    proyectosTotal: Number(embudoCoreCounts.proyectosTotal || 0),
    cotizacionesConPedido: Number(embudoCoreCounts.cotizacionesConPedido || 0),
    pedidosConProyecto: Number(embudoCoreCounts.pedidosConProyecto || 0),
    cotizacionesConProyectoFinal: Number(
      embudoCoreCounts.cotizacionesConProyectoFinal || 0
    ),
  };

  return {
    generatedAt: new Date().toISOString(),
    resumen: {
      fasesCore: {
        cotizacionesPorEstado: (cotizacionesPorEstado || []).map((r) => ({
          id: Number(r.id),
          nombre: r.nombre,
          total: Number(r.total || 0),
        })),
        pedidosPorEstado: (pedidosPorEstado || []).map((r) => ({
          id: Number(r.id),
          nombre: r.nombre,
          total: Number(r.total || 0),
        })),
        proyectosPorEstado: (proyectosPorEstado || []).map((r) => ({
          id: Number(r.id),
          nombre: r.nombre,
          total: Number(r.total || 0),
        })),
      },
      embudoCore: {
        ...embudo,
        conversiones: {
          cotizacionAPedidoPct: toPercent(
            embudo.cotizacionesConPedido,
            embudo.cotizacionesTotal
          ),
          pedidoAProyectoPct: toPercent(
            embudo.pedidosConProyecto,
            embudo.pedidosTotal
          ),
          cotizacionAProyectoPct: toPercent(
            embudo.cotizacionesConProyectoFinal,
            embudo.cotizacionesTotal
          ),
        },
      },
      antiguedadFases: {
        cotizacionSinPedido: {
          total: Number(cotizacionSinPedido.total || 0),
          promedioDias: Number(cotizacionSinPedido.promedioDias || 0),
          maxDias: Number(cotizacionSinPedido.maxDias || 0),
        },
        pedidoSinProyecto: {
          total: Number(pedidoSinProyecto.total || 0),
          promedioDias: Number(pedidoSinProyecto.promedioDias || 0),
          maxDias: Number(pedidoSinProyecto.maxDias || 0),
        },
        proyectoActivoNoEntregado: {
          total: Number(proyectoActivoNoEntregado.total || 0),
          promedioDias: Number(proyectoActivoNoEntregado.promedioDias || 0),
          maxDias: Number(proyectoActivoNoEntregado.maxDias || 0),
        },
      },
      proyectosDelDia: {
        hoy: {
          fecha: hoy,
          totalProyectos: Number(proyectosHoy.totalProyectos || 0),
          totalDias: Number(proyectosHoy.totalDias || 0),
        },
        manana: {
          fecha: manana,
          totalProyectos: Number(proyectosManana.totalProyectos || 0),
          totalDias: Number(proyectosManana.totalDias || 0),
        },
      },
      alertasResumen: {
        equiposNoDevueltos: Number(devolucionesCount.totalEquiposPendientes || 0),
        diasSuspendidosPorReprogramar: Number(
          suspendidosPorReprogramarCount.totalDias || 0
        ),
        proyectoListoSinLinkFinal: Number(
          listoSinLinkFinalCount.totalProyectos || 0
        ),
      },
    },
    cacheHint: {
      scope: "private",
      ttlSeconds: 60,
    },
  };
}

async function getDashboardAlertas() {
  const [
    listoSinLinkFinalCount,
    listoSinLinkFinalItems,
    devolucionesCount,
    devolucionesItems,
    suspendidosCount,
    suspendidosItems,
  ] = await Promise.all([
    repo.getAlertaProyectoListoSinLinkFinalCount(),
    repo.listAlertaProyectoListoSinLinkFinal(),
    repo.getAlertaDevolucionesPendientesCount(),
    repo.listAlertaDevolucionesPendientes(),
    repo.getAlertaDiasSuspendidosPorReprogramarCount(),
    repo.listAlertaDiasSuspendidosPorReprogramar(),
  ]);

  const totalAlertas =
    Number(listoSinLinkFinalCount.totalProyectos || 0) +
    Number(devolucionesCount.totalEquiposPendientes || 0) +
    Number(suspendidosCount.totalDias || 0);

  return {
    generatedAt: new Date().toISOString(),
    totalAlertas,
    colaOperativa: {
      proyectoListoSinLinkFinal: {
        total: Number(listoSinLinkFinalCount.totalProyectos || 0),
        prioridad: "alta",
        items: Array.isArray(listoSinLinkFinalItems)
          ? listoSinLinkFinalItems
          : [],
      },
      equiposNoDevueltos: {
        total: Number(devolucionesCount.totalEquiposPendientes || 0),
        totalDias: Number(devolucionesCount.totalDiasConPendientes || 0),
        prioridad: "alta",
        items: Array.isArray(devolucionesItems) ? devolucionesItems : [],
      },
      diasSuspendidosPorReprogramar: {
        total: Number(suspendidosCount.totalDias || 0),
        prioridad: "media",
        items: Array.isArray(suspendidosItems) ? suspendidosItems : [],
      },
    },
  };
}

async function getDashboardCapacidad(query = {}) {
  const { fromYmd, toYmd } = parseDateRange(query);

  const [
    staffTotalRow,
    equipoTotalRow,
    staffPorDiaRows,
    equipoPorDiaRows,
  ] = await Promise.all([
    repo.getCapacidadStaffTotal(),
    repo.getCapacidadEquipoTotal(),
    repo.listUsoStaffPorDia(fromYmd, toYmd),
    repo.listUsoEquipoPorDia(fromYmd, toYmd),
  ]);

  const staffPorFecha = new Map(
    (staffPorDiaRows || []).map((r) => [r.fecha, r])
  );
  const equipoPorFecha = new Map(
    (equipoPorDiaRows || []).map((r) => [r.fecha, r])
  );

  const fechas = iterateYmdRange(fromYmd, toYmd);
  const totales = {
    staffTotal: Number(staffTotalRow.totalStaff || 0),
    equipoTotal: Number(equipoTotalRow.totalEquipos || 0),
  };

  const capacidadPorDia = fechas.map((fecha) =>
    toCapacityRow(fecha, staffPorFecha.get(fecha), equipoPorFecha.get(fecha), totales)
  );

  const riesgoStaffDias = capacidadPorDia.filter((d) => d.staff.saturacionPct >= 80).length;
  const riesgoEquipoDias = capacidadPorDia.filter((d) => d.equipo.saturacionPct >= 80).length;

  return {
    generatedAt: new Date().toISOString(),
    range: {
      from: fromYmd,
      to: toYmd,
    },
    capacidadBase: {
      totalStaffActivo: totales.staffTotal,
      totalEquipoDisponible: totales.equipoTotal,
    },
    resumen: {
      diasEvaluados: capacidadPorDia.length,
      diasRiesgoStaff80: riesgoStaffDias,
      diasRiesgoEquipo80: riesgoEquipoDias,
    },
    capacidadPorDia,
  };
}

module.exports = {
  getKpisOperativosMinimos,
  getAgendaOperativa,
  getDashboardResumen,
  getDashboardAlertas,
  getDashboardCapacidad,
};
