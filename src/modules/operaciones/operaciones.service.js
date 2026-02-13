const repo = require("./operaciones.repository");
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function formatYmd(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildTargetDates(baseDateYmd = null) {
  const now = baseDateYmd ? ymdToLocalDate(baseDateYmd) : new Date();
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
  const from = query.from ?? query.fromYmd;
  const to = query.to ?? query.toYmd;
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

function parsePositiveInt(value, fallback, min = 1, max = 90) {
  if (value == null || value === "") return fallback;
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  const normalized = Math.trunc(n);
  if (normalized < min) return min;
  if (normalized > max) return max;
  return normalized;
}

function parseBaseDate(value) {
  if (value == null || value === "") return null;
  const ymd = String(value).trim();
  assert(ISO_DATE.test(ymd), "Parametro 'baseDate' debe ser YYYY-MM-DD");
  return ymd;
}

function ymdToLocalDate(ymd) {
  const [year, month, day] = String(ymd).split("-").map(Number);
  return new Date(year, month - 1, day);
}

function buildRollingRange(days = 14, baseDateYmd = null) {
  const now = baseDateYmd ? ymdToLocalDate(baseDateYmd) : new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + Math.max(Number(days) - 1, 0));
  return { fromYmd: formatYmd(start), toYmd: formatYmd(end) };
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

function attachEmpleadosToDias(dias, empleados) {
  const map = new Map();
  for (const e of empleados || []) {
    const key = Number(e.diaId);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push({
      asignacionId: Number(e.asignacionId),
      empleadoId: Number(e.empleadoId),
      empleadoNombre: e.empleadoNombre,
      notas: e.notas,
    });
  }
  return (dias || []).map((d) => ({
    ...d,
    empleados: map.get(Number(d.diaId)) || [],
  }));
}

function attachEquiposToDias(dias, equipos) {
  const map = new Map();
  for (const e of equipos || []) {
    const key = Number(e.diaId);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push({
      asignacionId: Number(e.asignacionId),
      equipoId: Number(e.equipoId),
      equipoSerie: e.equipoSerie,
      modelo: e.modelo,
      tipoEquipo: e.tipoEquipo,
      responsableId: e.responsableId != null ? Number(e.responsableId) : null,
      responsableNombre: e.responsableNombre,
      devuelto: Number(e.devuelto || 0) === 1,
      notas: e.notas,
    });
  }
  return (dias || []).map((d) => ({
    ...d,
    equipos: map.get(Number(d.diaId)) || [],
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

function getHoraInicioDia(dia) {
  if (!Array.isArray(dia?.bloques) || dia.bloques.length === 0) return null;
  const horas = dia.bloques
    .map((b) => (b?.hora ? String(b.hora) : null))
    .filter(Boolean)
    .sort();
  return horas[0] || null;
}

function buildAgendaHoyAccionable(proyectoDias = []) {
  return proyectoDias
    .map((d) => {
      const riesgos = {
        sinStaff: Number(d.totalEmpleados || 0) === 0,
        sinEquipo: Number(d.totalEquipos || 0) === 0,
        equipoPendienteDevolucion: Number(d.totalEquiposPendientes || 0) > 0,
        pagoConSaldo:
          String(d.estadoPago || "").toLowerCase() === "pendiente" ||
          String(d.estadoPago || "").toLowerCase() === "parcial",
      };
      return {
        diaId: Number(d.diaId),
        proyectoId: Number(d.proyectoId),
        proyecto: d.proyecto,
        pedidoId: d.pedidoId != null ? Number(d.pedidoId) : null,
        pedido: d.pedido,
        horaInicio: getHoraInicioDia(d),
        estadoDia: d.estadoDia,
        estadoProyecto: d.estadoProyecto,
        estadoPedido: d.estadoPedido,
        estadoPago: d.estadoPago,
        totalBloques: Number(d.totalBloques || 0),
        totalEmpleados: Number(d.totalEmpleados || 0),
        totalEquipos: Number(d.totalEquipos || 0),
        totalEquiposPendientes: Number(d.totalEquiposPendientes || 0),
        ubicacionPrincipal: d.bloques?.[0]?.ubicacion || null,
        riesgos,
        riesgoCount: Object.values(riesgos).filter(Boolean).length,
      };
    })
    .sort((a, b) => {
      if (b.riesgoCount !== a.riesgoCount) return b.riesgoCount - a.riesgoCount;
      return String(a.horaInicio || "99:99:99").localeCompare(
        String(b.horaInicio || "99:99:99")
      );
    });
}

function buildColaPendientesHoy(agendaHoyAccionable = []) {
  const cola = [];
  for (const item of agendaHoyAccionable) {
    if (item.riesgos.sinStaff) {
      cola.push({
        tipo: "asignacion_staff",
        prioridad: "alta",
        proyectoId: item.proyectoId,
        diaId: item.diaId,
        mensaje: `Dia sin staff asignado: ${item.proyecto}`,
      });
    }
    if (item.riesgos.sinEquipo) {
      cola.push({
        tipo: "asignacion_equipo",
        prioridad: "alta",
        proyectoId: item.proyectoId,
        diaId: item.diaId,
        mensaje: `Dia sin equipo asignado: ${item.proyecto}`,
      });
    }
    if (item.riesgos.pagoConSaldo) {
      cola.push({
        tipo: "cobro_pendiente",
        prioridad: "media",
        proyectoId: item.proyectoId,
        pedidoId: item.pedidoId,
        mensaje: `Pedido con saldo pendiente/parcial: ${item.pedido || item.proyecto}`,
      });
    }
  }
  return cola.slice(0, 20);
}

function buildOcupacionHoy(proyectoDias = [], capacidadHoy = null) {
  const empleadosMap = new Map();
  const equiposMap = new Map();

  for (const dia of proyectoDias || []) {
    for (const emp of dia.empleados || []) {
      const empleadoId = Number(emp.empleadoId);
      if (!Number.isFinite(empleadoId) || empleadoId <= 0) continue;
      if (!empleadosMap.has(empleadoId)) {
        empleadosMap.set(empleadoId, {
          empleadoId,
          empleadoNombre: emp.empleadoNombre || null,
          proyectos: new Set(),
          dias: new Set(),
        });
      }
      const row = empleadosMap.get(empleadoId);
      row.proyectos.add(Number(dia.proyectoId));
      row.dias.add(Number(dia.diaId));
    }

    for (const eq of dia.equipos || []) {
      const equipoId = Number(eq.equipoId);
      if (!Number.isFinite(equipoId) || equipoId <= 0) continue;
      if (!equiposMap.has(equipoId)) {
        equiposMap.set(equipoId, {
          equipoId,
          equipoSerie: eq.equipoSerie || null,
          modelo: eq.modelo || null,
          tipoEquipo: eq.tipoEquipo || null,
          proyectos: new Set(),
          dias: new Set(),
          pendientesDevolucion: 0,
        });
      }
      const row = equiposMap.get(equipoId);
      row.proyectos.add(Number(dia.proyectoId));
      row.dias.add(Number(dia.diaId));
      if (!eq.devuelto) row.pendientesDevolucion += 1;
    }
  }

  const personas = Array.from(empleadosMap.values()).map((r) => ({
    empleadoId: r.empleadoId,
    empleadoNombre: r.empleadoNombre,
    totalProyectos: r.proyectos.size,
    totalDias: r.dias.size,
  }));
  const equipos = Array.from(equiposMap.values()).map((r) => ({
    equipoId: r.equipoId,
    equipoSerie: r.equipoSerie,
    modelo: r.modelo,
    tipoEquipo: r.tipoEquipo,
    totalProyectos: r.proyectos.size,
    totalDias: r.dias.size,
    pendientesDevolucion: r.pendientesDevolucion,
  }));

  return {
    resumen: {
      personasOcupadas: personas.length,
      equiposOcupados: equipos.length,
      capacidadStaffTotal: Number(capacidadHoy?.staff?.capacidadTotal || 0),
      capacidadEquipoTotal: Number(capacidadHoy?.equipo?.capacidadTotal || 0),
      porcentajeStaffOcupado: Number(capacidadHoy?.staff?.saturacionPct || 0),
      porcentajeEquipoOcupado: Number(capacidadHoy?.equipo?.saturacionPct || 0),
    },
    personas,
    equipos,
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
  const includeDetalles = String(query.includeDetalles ?? "1").trim() !== "0";

  const [proyectoDiasRaw, pedidoEventosRaw] = await Promise.all([
    repo.listAgendaProyectoDias(fromYmd, toYmd),
    repo.listAgendaPedidosEventos(fromYmd, toYmd),
  ]);

  const diaIds = (proyectoDiasRaw || []).map((d) => Number(d.diaId));
  const bloquesPromise = repo.listAgendaBloquesByDiaIds(diaIds);
  const empleadosPromise = includeDetalles
    ? repo.listAgendaEmpleadosByDiaIds(diaIds)
    : Promise.resolve([]);
  const equiposPromise = includeDetalles
    ? repo.listAgendaEquiposByDiaIds(diaIds)
    : Promise.resolve([]);
  const [bloques, empleados, equipos] = await Promise.all([
    bloquesPromise,
    empleadosPromise,
    equiposPromise,
  ]);

  const conBloques = attachBloquesToDias(proyectoDiasRaw, bloques);
  const conEmpleados = attachEmpleadosToDias(conBloques, empleados);
  const proyectoDias = attachEquiposToDias(conEmpleados, equipos);

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
    estadoPagoId: r.estadoPagoId != null ? Number(r.estadoPagoId) : null,
    estadoPago: r.estadoPago,
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
    estadoPagoId: d.estadoPagoId != null ? Number(d.estadoPagoId) : null,
    estadoPago: d.estadoPago,
    totalBloques: Number(d.totalBloques || 0),
    totalEmpleados: Number(d.totalEmpleados || 0),
    totalEquipos: Number(d.totalEquipos || 0),
    totalEquiposPendientes: Number(d.totalEquiposPendientes || 0),
    bloques: Array.isArray(d.bloques) ? d.bloques : [],
    empleados: Array.isArray(d.empleados) ? d.empleados : [],
    equipos: Array.isArray(d.equipos) ? d.equipos : [],
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

async function getDashboardResumen(options = {}) {
  const baseDateYmd = parseBaseDate(options.baseDate);
  const { hoy, manana } = buildTargetDates(baseDateYmd);
  const horizonDays = parsePositiveInt(options.horizonDays, 1, 1, 45);

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
    cotizacionesPorExpirarCount,
    pedidosEnRiesgoCount,
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
    repo.getAlertaCotizacionesPorExpirarCount(horizonDays, baseDateYmd),
    repo.getAlertaPedidosEnRiesgoCount(horizonDays, baseDateYmd),
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
        cotizacionesPorExpirar7d: Number(
          cotizacionesPorExpirarCount.totalCotizaciones || 0
        ),
        pedidosEnRiesgo7d: Number(pedidosEnRiesgoCount.totalPedidos || 0),
      },
    },
    cacheHint: {
      scope: "private",
      ttlSeconds: 60,
    },
  };
}

async function getDashboardAlertas(options = {}) {
  const baseDateYmd = parseBaseDate(options.baseDate);
  const horizonDays = parsePositiveInt(options.horizonDays, 1, 1, 45);
  const [
    listoSinLinkFinalCount,
    listoSinLinkFinalItems,
    devolucionesCount,
    devolucionesItems,
    suspendidosCount,
    suspendidosItems,
    cotizacionesPorExpirarCount,
    cotizacionesPorExpirarItems,
    pedidosEnRiesgoCount,
    pedidosEnRiesgoItems,
  ] = await Promise.all([
    repo.getAlertaProyectoListoSinLinkFinalCount(),
    repo.listAlertaProyectoListoSinLinkFinal(),
    repo.getAlertaDevolucionesPendientesCount(),
    repo.listAlertaDevolucionesPendientes(),
    repo.getAlertaDiasSuspendidosPorReprogramarCount(),
    repo.listAlertaDiasSuspendidosPorReprogramar(),
    repo.getAlertaCotizacionesPorExpirarCount(horizonDays, baseDateYmd),
    repo.listAlertaCotizacionesPorExpirar(25, horizonDays, baseDateYmd),
    repo.getAlertaPedidosEnRiesgoCount(horizonDays, baseDateYmd),
    repo.listAlertaPedidosEnRiesgo(25, horizonDays, baseDateYmd),
  ]);

  const totalAlertas =
    Number(listoSinLinkFinalCount.totalProyectos || 0) +
    Number(devolucionesCount.totalEquiposPendientes || 0) +
    Number(suspendidosCount.totalDias || 0) +
    Number(cotizacionesPorExpirarCount.totalCotizaciones || 0) +
    Number(pedidosEnRiesgoCount.totalPedidos || 0);

  return {
    generatedAt: new Date().toISOString(),
    horizonDays,
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
      cotizacionesPorExpirar: {
        total: Number(cotizacionesPorExpirarCount.totalCotizaciones || 0),
        totalVencidas: Number(cotizacionesPorExpirarCount.totalVencidas || 0),
        prioridad: "alta",
        items: Array.isArray(cotizacionesPorExpirarItems)
          ? cotizacionesPorExpirarItems
          : [],
      },
      pedidosEnRiesgo: {
        total: Number(pedidosEnRiesgoCount.totalPedidos || 0),
        totalVencidos: Number(pedidosEnRiesgoCount.totalVencidos || 0),
        totalSinFechaEvento: Number(
          pedidosEnRiesgoCount.totalSinFechaEvento || 0
        ),
        prioridad: "alta",
        items: Array.isArray(pedidosEnRiesgoItems) ? pedidosEnRiesgoItems : [],
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

async function getDashboardHome(query = {}) {
  const baseDateYmd = parseBaseDate(query.baseDate);
  const strictDay = String(query.strictDay ?? "1").trim() !== "0";
  const agendaDays = strictDay
    ? 1
    : parsePositiveInt(query.agendaDays, 1, 1, 45);
  const horizonDays = strictDay
    ? 1
    : parsePositiveInt(query.horizonDays, 1, 1, 45);
  const { hoy } = buildTargetDates(baseDateYmd);
  const todayRange = { from: hoy, to: hoy, fromYmd: hoy, toYmd: hoy };
  const rollingRange = buildRollingRange(agendaDays, baseDateYmd);
  const range = strictDay
    ? todayRange
    : {
        from: rollingRange.fromYmd,
        to: rollingRange.toYmd,
        fromYmd: rollingRange.fromYmd,
        toYmd: rollingRange.toYmd,
      };

  const [resumen, alertas, capacidad, agenda, agendaHoy, cobrosHoy] = await Promise.all([
    getDashboardResumen({ horizonDays, baseDate: baseDateYmd }),
    getDashboardAlertas({ horizonDays, baseDate: baseDateYmd }),
    getDashboardCapacidad(range),
    getAgendaOperativa({ ...range, includeDetalles: "1" }),
    getAgendaOperativa({ ...todayRange, includeDetalles: "1" }),
    repo.getResumenCobrosDelDia(hoy),
  ]);

  const agendaConConflictos = (agenda?.agenda?.proyectoDias || []).map((d) => {
    const capDia = (capacidad.capacidadPorDia || []).find((c) => c.fecha === d.fecha);
    return {
      ...d,
      riesgosCapacidad: {
        staff80: Boolean(capDia?.staff?.saturacionPct >= 80),
        equipo80: Boolean(capDia?.equipo?.saturacionPct >= 80),
      },
    };
  });

  const capacidadHoy =
    (capacidad?.capacidadPorDia || []).find((d) => d.fecha === hoy) || null;
  const agendaHoyAccionable = buildAgendaHoyAccionable(
    agendaHoy?.agenda?.proyectoDias || []
  );
  const pendientesHoy = buildColaPendientesHoy(agendaHoyAccionable);
  const proyectosEnCursoHoy = agendaHoyAccionable.filter(
    (x) => String(x.estadoDia || "").toLowerCase() === "en curso"
  ).length;
  const proyectosPendientesInicioHoy = agendaHoyAccionable.filter(
    (x) => String(x.estadoDia || "").toLowerCase() === "pendiente"
  ).length;
  const equiposPorDevolverHoy = agendaHoyAccionable.reduce(
    (acc, x) => acc + Number(x.totalEquiposPendientes || 0),
    0
  );
  const eventosHoy = Number(
    new Set(
      (agendaHoy?.agenda?.proyectoDias || [])
        .map((x) => Number(x.proyectoId))
        .filter((id) => Number.isFinite(id) && id > 0)
    ).size
  );

  return {
    generatedAt: new Date().toISOString(),
    range,
    strictDay,
    operacionDia: {
      fecha: hoy,
      tarjetas: {
        serviciosProgramadosHoy: Number(agendaHoyAccionable.length || 0),
        eventosHoy,
        proyectosEnCursoHoy,
        proyectosPendientesInicioHoy,
        equiposPorDevolverHoy,
        pagosConSaldoHoy: Number(cobrosHoy.pedidosConSaldo || 0),
      },
      capacidadHoy: capacidadHoy || {
        fecha: hoy,
        staff: {
          capacidadTotal: 0,
          usado: 0,
          libre: 0,
          saturacionPct: 0,
          asignaciones: 0,
          sobreasignado: false,
        },
        equipo: {
          capacidadTotal: 0,
          usado: 0,
          libre: 0,
          saturacionPct: 0,
          asignaciones: 0,
          pendientesDevolucion: 0,
          sobreasignado: false,
        },
      },
      cobrosHoy: {
        pedidosPendientePago: Number(cobrosHoy.pedidosPendientePago || 0),
        pedidosParcialPago: Number(cobrosHoy.pedidosParcialPago || 0),
        pedidosPagado: Number(cobrosHoy.pedidosPagado || 0),
        pedidosCerradoPago: Number(cobrosHoy.pedidosCerradoPago || 0),
        pedidosConSaldo: Number(cobrosHoy.pedidosConSaldo || 0),
      },
      agendaHoy: {
        total: agendaHoyAccionable.length,
        items: agendaHoyAccionable,
      },
      colaPendientesHoy: pendientesHoy,
    },
    dashboard: {
      resumen: resumen.resumen,
      alertas: alertas,
      agenda: {
        ...agenda,
        agenda: {
          ...agenda.agenda,
          proyectoDias: agendaConConflictos,
        },
      },
      capacidad: capacidad,
    },
  };
}

async function getDashboardOperativoDiario(query = {}) {
  const baseDateYmd = parseBaseDate(query.baseDate);
  const { hoy } = buildTargetDates(baseDateYmd);
  const todayRange = { from: hoy, to: hoy, fromYmd: hoy, toYmd: hoy };

  const [agendaHoy, capacidadHoyPack, cobrosHoy] = await Promise.all([
    getAgendaOperativa({ ...todayRange, includeDetalles: "1" }),
    getDashboardCapacidad(todayRange),
    repo.getResumenCobrosDelDia(hoy),
  ]);

  const proyectoDiasHoy = agendaHoy?.agenda?.proyectoDias || [];
  const capacidadHoy =
    (capacidadHoyPack?.capacidadPorDia || []).find((d) => d.fecha === hoy) || null;
  const agendaHoyAccionable = buildAgendaHoyAccionable(proyectoDiasHoy);

  const eventosHoy = Number(
    new Set(
      proyectoDiasHoy
        .map((x) => Number(x.proyectoId))
        .filter((id) => Number.isFinite(id) && id > 0)
    ).size
  );

  const eventosEnCursoHoy = Number(
    new Set(
      agendaHoyAccionable
        .filter((x) => String(x.estadoDia || "").toLowerCase() === "en curso")
        .map((x) => Number(x.proyectoId))
        .filter((id) => Number.isFinite(id) && id > 0)
    ).size
  );

  const eventosPendientesInicioHoy = Number(
    new Set(
      agendaHoyAccionable
        .filter((x) => String(x.estadoDia || "").toLowerCase() === "pendiente")
        .map((x) => Number(x.proyectoId))
        .filter((id) => Number.isFinite(id) && id > 0)
    ).size
  );

  const colaPendientesHoy = agendaHoyAccionable
    .filter(
      (x) =>
        String(x.estadoDia || "").toLowerCase() !== "en curso" &&
        Number(x.totalEmpleados || 0) === 0 &&
        Number(x.totalEquipos || 0) === 0
    )
    .map((x) => ({
      tipo: "pendiente_inicio_sin_asignaciones",
      prioridad: "alta",
      proyectoId: x.proyectoId,
      diaId: x.diaId,
      pedidoId: x.pedidoId,
      mensaje: `Proyecto pendiente sin staff/equipo: ${x.proyecto}`,
    }));

  const ocupacionHoy = buildOcupacionHoy(proyectoDiasHoy, capacidadHoy);

  return {
    generatedAt: new Date().toISOString(),
    fecha: hoy,
    range: todayRange,
    strictDay: true,
    cards: {
      eventosHoy,
      eventosEnCursoHoy,
      eventosPendientesInicioHoy,
      serviciosProgramadosHoy: Number(agendaHoyAccionable.length || 0),
    },
    resumenHoy: {
      totalProyectosConDiaHoy: eventosHoy,
      totalProyectoDiasHoy: Number(proyectoDiasHoy.length || 0),
      estadoDia: {
        pendiente: agendaHoyAccionable.filter(
          (x) => String(x.estadoDia || "").toLowerCase() === "pendiente"
        ).length,
        enCurso: agendaHoyAccionable.filter(
          (x) => String(x.estadoDia || "").toLowerCase() === "en curso"
        ).length,
        terminado: agendaHoyAccionable.filter(
          (x) => String(x.estadoDia || "").toLowerCase() === "terminado"
        ).length,
        suspendido: agendaHoyAccionable.filter(
          (x) => String(x.estadoDia || "").toLowerCase() === "suspendido"
        ).length,
        cancelado: agendaHoyAccionable.filter(
          (x) => String(x.estadoDia || "").toLowerCase() === "cancelado"
        ).length,
      },
      cobrosHoy: {
        pedidosPendientePago: Number(cobrosHoy.pedidosPendientePago || 0),
        pedidosParcialPago: Number(cobrosHoy.pedidosParcialPago || 0),
        pedidosPagado: Number(cobrosHoy.pedidosPagado || 0),
        pedidosCerradoPago: Number(cobrosHoy.pedidosCerradoPago || 0),
        pedidosConSaldo: Number(cobrosHoy.pedidosConSaldo || 0),
      },
    },
    agendaHoy: {
      total: agendaHoyAccionable.length,
      items: agendaHoyAccionable,
    },
    colaPendientesHoy: {
      total: colaPendientesHoy.length,
      items: colaPendientesHoy,
    },
    ocupacionHoy,
    capacidadHoy:
      capacidadHoy || {
        fecha: hoy,
        staff: {
          capacidadTotal: 0,
          usado: 0,
          libre: 0,
          saturacionPct: 0,
          asignaciones: 0,
          sobreasignado: false,
        },
        equipo: {
          capacidadTotal: 0,
          usado: 0,
          libre: 0,
          saturacionPct: 0,
          asignaciones: 0,
          pendientesDevolucion: 0,
          sobreasignado: false,
        },
      },
  };
}

module.exports = {
  getKpisOperativosMinimos,
  getAgendaOperativa,
  getDashboardResumen,
  getDashboardAlertas,
  getDashboardCapacidad,
  getDashboardHome,
  getDashboardOperativoDiario,
};
