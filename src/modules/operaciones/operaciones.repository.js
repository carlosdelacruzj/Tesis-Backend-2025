const pool = require("../../db");

async function listPedidosPorEstado() {
  const [rows] = await pool.query(
    `SELECT
       ep.PK_EP_Cod AS id,
       ep.EP_Nombre AS nombre,
       COUNT(p.PK_P_Cod) AS total
     FROM T_Estado_Pedido ep
     LEFT JOIN T_Pedido p
       ON p.FK_EP_Cod = ep.PK_EP_Cod
     GROUP BY ep.PK_EP_Cod, ep.EP_Nombre
     ORDER BY ep.PK_EP_Cod`
  );
  return rows;
}

async function listProyectosPorEstado() {
  const [rows] = await pool.query(
    `SELECT
       ep.PK_EPro_Cod AS id,
       ep.EPro_Nombre AS nombre,
       COUNT(p.PK_Pro_Cod) AS total
     FROM T_Estado_Proyecto ep
     LEFT JOIN T_Proyecto p
       ON p.Pro_Estado = ep.PK_EPro_Cod
     GROUP BY ep.PK_EPro_Cod, ep.EPro_Nombre, ep.EPro_Orden
     ORDER BY ep.EPro_Orden, ep.PK_EPro_Cod`
  );
  return rows;
}

async function listCotizacionesPorEstado() {
  const [rows] = await pool.query(
    `SELECT
       ec.PK_ECot_Cod AS id,
       ec.ECot_Nombre AS nombre,
       COUNT(c.PK_Cot_Cod) AS total
     FROM T_Estado_Cotizacion ec
     LEFT JOIN T_Cotizacion c
       ON c.FK_ECot_Cod = ec.PK_ECot_Cod
     GROUP BY ec.PK_ECot_Cod, ec.ECot_Nombre
     ORDER BY ec.PK_ECot_Cod`
  );
  return rows;
}

async function getEmbudoCoreCounts() {
  const [rows] = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM T_Cotizacion) AS cotizacionesTotal,
       (SELECT COUNT(*) FROM T_Pedido) AS pedidosTotal,
       (SELECT COUNT(*) FROM T_Proyecto) AS proyectosTotal,
       (
         SELECT COUNT(DISTINCT c.PK_Cot_Cod)
         FROM T_Cotizacion c
         INNER JOIN T_Pedido p ON p.FK_Cot_Cod = c.PK_Cot_Cod
       ) AS cotizacionesConPedido,
       (
         SELECT COUNT(DISTINCT p.PK_P_Cod)
         FROM T_Pedido p
         INNER JOIN T_Proyecto pr ON pr.FK_P_Cod = p.PK_P_Cod
       ) AS pedidosConProyecto,
       (
         SELECT COUNT(DISTINCT c.PK_Cot_Cod)
         FROM T_Cotizacion c
         INNER JOIN T_Pedido p ON p.FK_Cot_Cod = c.PK_Cot_Cod
         INNER JOIN T_Proyecto pr ON pr.FK_P_Cod = p.PK_P_Cod
       ) AS cotizacionesConProyectoFinal`
  );
  return rows[0] || {};
}

async function getAntiguedadFaseCotizacionSinPedido() {
  const [rows] = await pool.query(
    `SELECT
       COUNT(*) AS total,
       IFNULL(ROUND(AVG(DATEDIFF(CURDATE(), DATE(c.Cot_Fecha_Crea))), 2), 0) AS promedioDias,
       IFNULL(MAX(DATEDIFF(CURDATE(), DATE(c.Cot_Fecha_Crea))), 0) AS maxDias
     FROM T_Cotizacion c
     LEFT JOIN T_Pedido p ON p.FK_Cot_Cod = c.PK_Cot_Cod
     WHERE p.PK_P_Cod IS NULL`
  );
  return rows[0] || { total: 0, promedioDias: 0, maxDias: 0 };
}

async function getAntiguedadFasePedidoSinProyecto() {
  const [rows] = await pool.query(
    `SELECT
       COUNT(*) AS total,
       IFNULL(ROUND(AVG(DATEDIFF(CURDATE(), DATE(p.P_Fecha_Creacion))), 2), 0) AS promedioDias,
       IFNULL(MAX(DATEDIFF(CURDATE(), DATE(p.P_Fecha_Creacion))), 0) AS maxDias
     FROM T_Pedido p
     LEFT JOIN T_Proyecto pr ON pr.FK_P_Cod = p.PK_P_Cod
     WHERE pr.PK_Pro_Cod IS NULL`
  );
  return rows[0] || { total: 0, promedioDias: 0, maxDias: 0 };
}

async function getAntiguedadFaseProyectoActivo() {
  const [rows] = await pool.query(
    `SELECT
       COUNT(*) AS total,
       IFNULL(ROUND(AVG(DATEDIFF(CURDATE(), DATE(pr.created_at))), 2), 0) AS promedioDias,
       IFNULL(MAX(DATEDIFF(CURDATE(), DATE(pr.created_at))), 0) AS maxDias
     FROM T_Proyecto pr
     LEFT JOIN T_Estado_Proyecto ep ON ep.PK_EPro_Cod = pr.Pro_Estado
     WHERE IFNULL(ep.EPro_Nombre, '') <> 'Entregado'`
  );
  return rows[0] || { total: 0, promedioDias: 0, maxDias: 0 };
}

async function listCuellosBotellaCotizaciones(limit = 10) {
  const [rows] = await pool.query(
    `SELECT
       c.PK_Cot_Cod AS cotizacionId,
       DATE_FORMAT(c.Cot_Fecha_Crea, '%Y-%m-%d') AS fechaCrea,
       DATEDIFF(CURDATE(), DATE(c.Cot_Fecha_Crea)) AS antiguedadDias,
       ec.ECot_Nombre AS estadoCotizacion
     FROM T_Cotizacion c
     LEFT JOIN T_Estado_Cotizacion ec ON ec.PK_ECot_Cod = c.FK_ECot_Cod
     LEFT JOIN T_Pedido p ON p.FK_Cot_Cod = c.PK_Cot_Cod
     WHERE p.PK_P_Cod IS NULL
     ORDER BY antiguedadDias DESC, c.PK_Cot_Cod ASC
     LIMIT ?`,
    [Number(limit)]
  );
  return rows;
}

async function listCuellosBotellaPedidos(limit = 10) {
  const [rows] = await pool.query(
    `SELECT
       p.PK_P_Cod AS pedidoId,
       DATE_FORMAT(p.P_Fecha_Creacion, '%Y-%m-%d') AS fechaCrea,
       DATEDIFF(CURDATE(), DATE(p.P_Fecha_Creacion)) AS antiguedadDias,
       ep.EP_Nombre AS estadoPedido
     FROM T_Pedido p
     LEFT JOIN T_Estado_Pedido ep ON ep.PK_EP_Cod = p.FK_EP_Cod
     LEFT JOIN T_Proyecto pr ON pr.FK_P_Cod = p.PK_P_Cod
     WHERE pr.PK_Pro_Cod IS NULL
     ORDER BY antiguedadDias DESC, p.PK_P_Cod ASC
     LIMIT ?`,
    [Number(limit)]
  );
  return rows;
}

async function listCuellosBotellaProyectos(limit = 10) {
  const [rows] = await pool.query(
    `SELECT
       pr.PK_Pro_Cod AS proyectoId,
       pr.Pro_Nombre AS proyecto,
       DATE_FORMAT(pr.created_at, '%Y-%m-%d') AS fechaCrea,
       DATEDIFF(CURDATE(), DATE(pr.created_at)) AS antiguedadDias,
       ep.EPro_Nombre AS estadoProyecto
     FROM T_Proyecto pr
     LEFT JOIN T_Estado_Proyecto ep ON ep.PK_EPro_Cod = pr.Pro_Estado
     WHERE IFNULL(ep.EPro_Nombre, '') <> 'Entregado'
     ORDER BY antiguedadDias DESC, pr.PK_Pro_Cod ASC
     LIMIT ?`,
    [Number(limit)]
  );
  return rows;
}

async function getProyectosDiaResumen(fechaYmd) {
  const [rows] = await pool.query(
    `SELECT
       ? AS fecha,
       COUNT(DISTINCT pd.FK_Pro_Cod) AS totalProyectos,
       COUNT(pd.PK_PD_Cod) AS totalDias
     FROM T_ProyectoDia pd
     WHERE DATE(pd.PD_Fecha) = ?`,
    [fechaYmd, fechaYmd]
  );
  return rows[0] || { fecha: fechaYmd, totalProyectos: 0, totalDias: 0 };
}

async function listProyectosDiaPorEstado(fechaYmd) {
  const [rows] = await pool.query(
    `SELECT
       epd.PK_EPD_Cod AS id,
       epd.EPD_Nombre AS nombre,
       COUNT(pd.PK_PD_Cod) AS total
     FROM T_Estado_Proyecto_Dia epd
     LEFT JOIN T_ProyectoDia pd
       ON pd.FK_EPD_Cod = epd.PK_EPD_Cod
      AND DATE(pd.PD_Fecha) = ?
     GROUP BY epd.PK_EPD_Cod, epd.EPD_Nombre, epd.EPD_Orden
     ORDER BY epd.EPD_Orden, epd.PK_EPD_Cod`,
    [fechaYmd]
  );
  return rows;
}

async function listProyectosDiaDetalle(fechaYmd) {
  const [rows] = await pool.query(
    `SELECT
       pd.PK_PD_Cod AS diaId,
       DATE_FORMAT(pd.PD_Fecha, '%Y-%m-%d') AS fecha,
       p.PK_Pro_Cod AS proyectoId,
       p.Pro_Nombre AS proyecto,
       ep.EPro_Nombre AS estadoProyecto,
       epd.EPD_Nombre AS estadoDia
     FROM T_ProyectoDia pd
     INNER JOIN T_Proyecto p ON p.PK_Pro_Cod = pd.FK_Pro_Cod
     LEFT JOIN T_Estado_Proyecto ep ON ep.PK_EPro_Cod = p.Pro_Estado
     LEFT JOIN T_Estado_Proyecto_Dia epd ON epd.PK_EPD_Cod = pd.FK_EPD_Cod
     WHERE DATE(pd.PD_Fecha) = ?
     ORDER BY p.PK_Pro_Cod, pd.PK_PD_Cod`,
    [fechaYmd]
  );
  return rows;
}

async function getAlertaDevolucionesPendientesCount() {
  const [rows] = await pool.query(
    `SELECT
       COUNT(*) AS totalEquiposPendientes,
       COUNT(DISTINCT pd.PK_PD_Cod) AS totalDiasConPendientes
     FROM T_ProyectoDiaEquipo pdq
     INNER JOIN T_ProyectoDia pd ON pd.PK_PD_Cod = pdq.FK_PD_Cod
     WHERE IFNULL(pdq.PDQ_Devuelto, 0) = 0
       AND DATE(pd.PD_Fecha) <= CURDATE()`
  );
  return rows[0] || { totalEquiposPendientes: 0, totalDiasConPendientes: 0 };
}

async function listAlertaDevolucionesPendientes() {
  const [rows] = await pool.query(
    `SELECT
       pd.PK_PD_Cod AS diaId,
       DATE_FORMAT(pd.PD_Fecha, '%Y-%m-%d') AS fecha,
       p.PK_Pro_Cod AS proyectoId,
       p.Pro_Nombre AS proyecto,
       SUM(CASE WHEN IFNULL(pdq.PDQ_Devuelto, 0) = 0 THEN 1 ELSE 0 END) AS pendientes
     FROM T_ProyectoDia pd
     INNER JOIN T_Proyecto p ON p.PK_Pro_Cod = pd.FK_Pro_Cod
     INNER JOIN T_ProyectoDiaEquipo pdq ON pdq.FK_PD_Cod = pd.PK_PD_Cod
     WHERE DATE(pd.PD_Fecha) <= CURDATE()
     GROUP BY pd.PK_PD_Cod, pd.PD_Fecha, p.PK_Pro_Cod, p.Pro_Nombre
     HAVING pendientes > 0
     ORDER BY pd.PD_Fecha ASC, pendientes DESC
     LIMIT 15`
  );
  return rows;
}

async function getAlertaDiasSuspendidosCanceladosCount() {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS totalDias
     FROM T_ProyectoDia pd
     INNER JOIN T_Estado_Proyecto_Dia epd ON epd.PK_EPD_Cod = pd.FK_EPD_Cod
     WHERE epd.EPD_Nombre IN ('Suspendido', 'Cancelado')`
  );
  return rows[0] || { totalDias: 0 };
}

async function listAlertaDiasSuspendidosCancelados() {
  const [rows] = await pool.query(
    `SELECT
       pd.PK_PD_Cod AS diaId,
       DATE_FORMAT(pd.PD_Fecha, '%Y-%m-%d') AS fecha,
       p.PK_Pro_Cod AS proyectoId,
       p.Pro_Nombre AS proyecto,
       epd.EPD_Nombre AS estadoDia
     FROM T_ProyectoDia pd
     INNER JOIN T_Proyecto p ON p.PK_Pro_Cod = pd.FK_Pro_Cod
     INNER JOIN T_Estado_Proyecto_Dia epd ON epd.PK_EPD_Cod = pd.FK_EPD_Cod
     WHERE epd.EPD_Nombre IN ('Suspendido', 'Cancelado')
     ORDER BY pd.PD_Fecha DESC, pd.PK_PD_Cod DESC
     LIMIT 15`
  );
  return rows;
}

async function getAlertaRetrasosCount() {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS totalDias
     FROM T_ProyectoDia pd
     INNER JOIN T_Estado_Proyecto_Dia epd ON epd.PK_EPD_Cod = pd.FK_EPD_Cod
     WHERE DATE(pd.PD_Fecha) < CURDATE()
       AND epd.EPD_Nombre NOT IN ('Terminado', 'Cancelado', 'Suspendido')`
  );
  return rows[0] || { totalDias: 0 };
}

async function listAlertaRetrasos() {
  const [rows] = await pool.query(
    `SELECT
       pd.PK_PD_Cod AS diaId,
       DATE_FORMAT(pd.PD_Fecha, '%Y-%m-%d') AS fecha,
       p.PK_Pro_Cod AS proyectoId,
       p.Pro_Nombre AS proyecto,
       epd.EPD_Nombre AS estadoDia
     FROM T_ProyectoDia pd
     INNER JOIN T_Proyecto p ON p.PK_Pro_Cod = pd.FK_Pro_Cod
     INNER JOIN T_Estado_Proyecto_Dia epd ON epd.PK_EPD_Cod = pd.FK_EPD_Cod
     WHERE DATE(pd.PD_Fecha) < CURDATE()
       AND epd.EPD_Nombre NOT IN ('Terminado', 'Cancelado', 'Suspendido')
     ORDER BY pd.PD_Fecha ASC, pd.PK_PD_Cod ASC
     LIMIT 15`
  );
  return rows;
}

async function listAgendaProyectoDias(fromYmd, toYmd) {
  const [rows] = await pool.query(
    `SELECT
       pd.PK_PD_Cod AS diaId,
       DATE_FORMAT(pd.PD_Fecha, '%Y-%m-%d') AS fecha,
       pd.FK_Pro_Cod AS proyectoId,
       pr.Pro_Nombre AS proyecto,
       epd.PK_EPD_Cod AS estadoDiaId,
       epd.EPD_Nombre AS estadoDia,
       pr.Pro_Estado AS estadoProyectoId,
       ep.EPro_Nombre AS estadoProyecto,
       pr.FK_P_Cod AS pedidoId,
       p.P_Nombre_Pedido AS pedido,
       p.FK_EP_Cod AS estadoPedidoId,
       epe.EP_Nombre AS estadoPedido,
       p.FK_ESP_Cod AS estadoPagoId,
       esp.ESP_Nombre AS estadoPago,
       IFNULL(bq.totalBloques, 0) AS totalBloques,
       IFNULL(emp.totalEmpleados, 0) AS totalEmpleados,
       IFNULL(eq.totalEquipos, 0) AS totalEquipos,
       IFNULL(eq.totalEquiposPendientes, 0) AS totalEquiposPendientes
     FROM T_ProyectoDia pd
     INNER JOIN T_Proyecto pr ON pr.PK_Pro_Cod = pd.FK_Pro_Cod
     LEFT JOIN T_Estado_Proyecto_Dia epd ON epd.PK_EPD_Cod = pd.FK_EPD_Cod
     LEFT JOIN T_Estado_Proyecto ep ON ep.PK_EPro_Cod = pr.Pro_Estado
     LEFT JOIN T_Pedido p ON p.PK_P_Cod = pr.FK_P_Cod
     LEFT JOIN T_Estado_Pedido epe ON epe.PK_EP_Cod = p.FK_EP_Cod
     LEFT JOIN T_Estado_Pago esp ON esp.PK_ESP_Cod = p.FK_ESP_Cod
     LEFT JOIN (
       SELECT FK_PD_Cod, COUNT(*) AS totalBloques
       FROM T_ProyectoDiaBloque
       GROUP BY FK_PD_Cod
     ) bq ON bq.FK_PD_Cod = pd.PK_PD_Cod
     LEFT JOIN (
       SELECT FK_PD_Cod, COUNT(*) AS totalEmpleados
       FROM T_ProyectoDiaEmpleado
       GROUP BY FK_PD_Cod
     ) emp ON emp.FK_PD_Cod = pd.PK_PD_Cod
     LEFT JOIN (
       SELECT
         FK_PD_Cod,
         COUNT(*) AS totalEquipos,
         SUM(CASE WHEN IFNULL(PDQ_Devuelto, 0) = 0 THEN 1 ELSE 0 END) AS totalEquiposPendientes
       FROM T_ProyectoDiaEquipo
       GROUP BY FK_PD_Cod
     ) eq ON eq.FK_PD_Cod = pd.PK_PD_Cod
     WHERE DATE(pd.PD_Fecha) BETWEEN ? AND ?
     ORDER BY pd.PD_Fecha ASC, pd.PK_PD_Cod ASC`,
    [fromYmd, toYmd]
  );
  return rows;
}

async function listAgendaBloquesByDiaIds(diaIds) {
  if (!Array.isArray(diaIds) || diaIds.length === 0) return [];
  const placeholders = diaIds.map(() => "?").join(",");
  const [rows] = await pool.query(
    `SELECT
       pdb.PK_PDB_Cod AS bloqueId,
       pdb.FK_PD_Cod AS diaId,
       TIME_FORMAT(pdb.PDB_Hora, '%H:%i:%s') AS hora,
       pdb.PDB_Ubicacion AS ubicacion,
       pdb.PDB_Direccion AS direccion,
       pdb.PDB_Notas AS notas,
       pdb.PDB_Orden AS orden
     FROM T_ProyectoDiaBloque pdb
     WHERE pdb.FK_PD_Cod IN (${placeholders})
     ORDER BY pdb.FK_PD_Cod ASC, pdb.PDB_Orden ASC, pdb.PK_PDB_Cod ASC`,
    diaIds
  );
  return rows;
}

async function listAgendaEmpleadosByDiaIds(diaIds) {
  if (!Array.isArray(diaIds) || diaIds.length === 0) return [];
  const placeholders = diaIds.map(() => "?").join(",");
  const [rows] = await pool.query(
    `SELECT
       pde.PK_PDE_Cod AS asignacionId,
       pde.FK_PD_Cod AS diaId,
       pde.FK_Em_Cod AS empleadoId,
       CONCAT(u.U_Nombre, ' ', u.U_Apellido) AS empleadoNombre,
       pde.PDE_Notas AS notas
     FROM T_ProyectoDiaEmpleado pde
     INNER JOIN T_Empleados em ON em.PK_Em_Cod = pde.FK_Em_Cod
     INNER JOIN T_Usuario u ON u.PK_U_Cod = em.FK_U_Cod
     WHERE pde.FK_PD_Cod IN (${placeholders})
     ORDER BY pde.FK_PD_Cod ASC, empleadoNombre ASC, pde.PK_PDE_Cod ASC`,
    diaIds
  );
  return rows;
}

async function listAgendaEquiposByDiaIds(diaIds) {
  if (!Array.isArray(diaIds) || diaIds.length === 0) return [];
  const placeholders = diaIds.map(() => "?").join(",");
  const [rows] = await pool.query(
    `SELECT
       pdq.PK_PDQ_Cod AS asignacionId,
       pdq.FK_PD_Cod AS diaId,
       pdq.FK_Eq_Cod AS equipoId,
       eq.Eq_Serie AS equipoSerie,
       mo.NMo_Nombre AS modelo,
       te.TE_Nombre AS tipoEquipo,
       pdq.FK_Em_Cod AS responsableId,
       CONCAT(u.U_Nombre, ' ', u.U_Apellido) AS responsableNombre,
       pdq.PDQ_Devuelto AS devuelto,
       pdq.PDQ_Notas AS notas
     FROM T_ProyectoDiaEquipo pdq
     INNER JOIN T_Equipo eq ON eq.PK_Eq_Cod = pdq.FK_Eq_Cod
     INNER JOIN T_Modelo mo ON mo.PK_IMo_Cod = eq.FK_IMo_Cod
     INNER JOIN T_Tipo_Equipo te ON te.PK_TE_Cod = mo.FK_TE_Cod
     LEFT JOIN T_Empleados em ON em.PK_Em_Cod = pdq.FK_Em_Cod
     LEFT JOIN T_Usuario u ON u.PK_U_Cod = em.FK_U_Cod
     WHERE pdq.FK_PD_Cod IN (${placeholders})
     ORDER BY pdq.FK_PD_Cod ASC, tipoEquipo ASC, modelo ASC, pdq.PK_PDQ_Cod ASC`,
    diaIds
  );
  return rows;
}

async function listAgendaPedidosEventos(fromYmd, toYmd) {
  const [rows] = await pool.query(
    `SELECT
       pe.PK_PE_Cod AS pedidoEventoId,
       pe.FK_P_Cod AS pedidoId,
       p.P_Nombre_Pedido AS pedido,
       DATE_FORMAT(pe.PE_Fecha, '%Y-%m-%d') AS fecha,
       TIME_FORMAT(pe.PE_Hora, '%H:%i:%s') AS hora,
       pe.PE_Ubicacion AS ubicacion,
       pe.PE_Direccion AS direccion,
       pe.PE_Notas AS notas,
       p.FK_EP_Cod AS estadoPedidoId,
       epe.EP_Nombre AS estadoPedido,
       p.FK_ESP_Cod AS estadoPagoId,
       esp.ESP_Nombre AS estadoPago,
       pr.PK_Pro_Cod AS proyectoIdVinculado
     FROM T_PedidoEvento pe
     INNER JOIN T_Pedido p ON p.PK_P_Cod = pe.FK_P_Cod
     LEFT JOIN T_Estado_Pedido epe ON epe.PK_EP_Cod = p.FK_EP_Cod
     LEFT JOIN T_Estado_Pago esp ON esp.PK_ESP_Cod = p.FK_ESP_Cod
     LEFT JOIN T_Proyecto pr ON pr.FK_P_Cod = p.PK_P_Cod
     WHERE DATE(pe.PE_Fecha) BETWEEN ? AND ?
     ORDER BY pe.PE_Fecha ASC, pe.PE_Hora ASC, pe.PK_PE_Cod ASC`,
    [fromYmd, toYmd]
  );
  return rows;
}

async function getResumenCobrosDelDia(fechaYmd) {
  const [rows] = await pool.query(
    `SELECT
       SUM(CASE WHEN esp.ESP_Nombre = 'Pendiente' THEN 1 ELSE 0 END) AS pedidosPendientePago,
       SUM(CASE WHEN esp.ESP_Nombre = 'Parcial' THEN 1 ELSE 0 END) AS pedidosParcialPago,
       SUM(CASE WHEN esp.ESP_Nombre = 'Pagado' THEN 1 ELSE 0 END) AS pedidosPagado,
       SUM(CASE WHEN esp.ESP_Nombre = 'Cerrado' THEN 1 ELSE 0 END) AS pedidosCerradoPago,
       SUM(CASE WHEN esp.ESP_Nombre IN ('Pendiente', 'Parcial') THEN 1 ELSE 0 END) AS pedidosConSaldo
     FROM T_Pedido p
     LEFT JOIN T_Estado_Pago esp ON esp.PK_ESP_Cod = p.FK_ESP_Cod
     LEFT JOIN (
       SELECT FK_P_Cod AS pedidoId, MIN(PE_Fecha) AS primerFecha
       FROM T_PedidoEvento
       GROUP BY FK_P_Cod
     ) ev ON ev.pedidoId = p.PK_P_Cod
     WHERE DATE(COALESCE(ev.primerFecha, p.P_FechaEvento)) = ?`,
    [fechaYmd]
  );
  return rows[0] || {
    pedidosPendientePago: 0,
    pedidosParcialPago: 0,
    pedidosPagado: 0,
    pedidosCerradoPago: 0,
    pedidosConSaldo: 0,
  };
}

async function getAlertaCotizacionesPorExpirarCount(horizonDays = 7, baseDateYmd = null) {
  const [rows] = await pool.query(
    `SELECT
       SUM(
         CASE
           WHEN base.diasParaEvento IS NOT NULL
             AND base.diasParaEvento BETWEEN 0 AND ?
           THEN 1 ELSE 0
         END
       ) AS totalPorEvento,
       SUM(
         CASE
           WHEN base.diasParaVencimientoComercial BETWEEN 0 AND ?
           THEN 1 ELSE 0
         END
       ) AS totalPorAntiguedadComercial,
       SUM(
         CASE
           WHEN (
             (base.diasParaEvento IS NOT NULL AND base.diasParaEvento <= ?)
             OR base.diasParaVencimientoComercial <= ?
           )
           THEN 1 ELSE 0
         END
       ) AS totalCotizaciones,
       SUM(
         CASE
           WHEN (
             (base.diasParaEvento IS NOT NULL AND base.diasParaEvento < 0)
             OR base.diasParaVencimientoComercial < 0
           )
           THEN 1 ELSE 0
         END
       ) AS totalVencidas
     FROM (
       SELECT
         c.PK_Cot_Cod AS cotizacionId,
         DATEDIFF(c.Cot_FechaEvento, COALESCE(DATE(?), CURDATE())) AS diasParaEvento,
         DATEDIFF(
           DATE_ADD(DATE(c.Cot_Fecha_Crea), INTERVAL 90 DAY),
           COALESCE(DATE(?), CURDATE())
         ) AS diasParaVencimientoComercial
       FROM T_Cotizacion c
       INNER JOIN T_Estado_Cotizacion ec ON ec.PK_ECot_Cod = c.FK_ECot_Cod
       LEFT JOIN T_Pedido p ON p.FK_Cot_Cod = c.PK_Cot_Cod
       WHERE p.PK_P_Cod IS NULL
         AND ec.ECot_Nombre IN ('Borrador', 'Enviada')
     ) base`,
    [
      Number(horizonDays),
      Number(horizonDays),
      Number(horizonDays),
      Number(horizonDays),
      baseDateYmd,
      baseDateYmd,
    ]
  );
  return rows[0] || {
    totalPorEvento: 0,
    totalPorAntiguedadComercial: 0,
    totalCotizaciones: 0,
    totalVencidas: 0,
  };
}

async function listAlertaCotizacionesPorExpirar(limit = 25, horizonDays = 7, baseDateYmd = null) {
  const [rows] = await pool.query(
    `SELECT
       c.PK_Cot_Cod AS cotizacionId,
       DATE_FORMAT(c.Cot_Fecha_Crea, '%Y-%m-%d') AS fechaCreacion,
       DATE_FORMAT(c.Cot_FechaEvento, '%Y-%m-%d') AS fechaEvento,
       ec.ECot_Nombre AS estadoCotizacion,
       DATEDIFF(c.Cot_FechaEvento, COALESCE(DATE(?), CURDATE())) AS diasParaEvento,
       DATEDIFF(
         DATE_ADD(DATE(c.Cot_Fecha_Crea), INTERVAL 90 DAY),
         COALESCE(DATE(?), CURDATE())
       ) AS diasParaVencimientoComercial,
       CASE
         WHEN (
           DATEDIFF(c.Cot_FechaEvento, COALESCE(DATE(?), CURDATE())) <= ?
           AND DATEDIFF(
             DATE_ADD(DATE(c.Cot_Fecha_Crea), INTERVAL 90 DAY),
             COALESCE(DATE(?), CURDATE())
           ) <= ?
         ) THEN 'evento_y_antiguedad'
         WHEN DATEDIFF(c.Cot_FechaEvento, COALESCE(DATE(?), CURDATE())) <= ? THEN 'evento'
         ELSE 'antiguedad'
       END AS motivoRiesgo
     FROM T_Cotizacion c
     INNER JOIN T_Estado_Cotizacion ec ON ec.PK_ECot_Cod = c.FK_ECot_Cod
     LEFT JOIN T_Pedido p ON p.FK_Cot_Cod = c.PK_Cot_Cod
     WHERE p.PK_P_Cod IS NULL
       AND ec.ECot_Nombre IN ('Borrador', 'Enviada')
       AND (
         (
           c.Cot_FechaEvento IS NOT NULL
           AND DATEDIFF(c.Cot_FechaEvento, COALESCE(DATE(?), CURDATE())) <= ?
         )
         OR DATEDIFF(
           DATE_ADD(DATE(c.Cot_Fecha_Crea), INTERVAL 90 DAY),
           COALESCE(DATE(?), CURDATE())
         ) <= ?
       )
     ORDER BY
       LEAST(
         COALESCE(DATEDIFF(c.Cot_FechaEvento, COALESCE(DATE(?), CURDATE())), 9999),
         DATEDIFF(
           DATE_ADD(DATE(c.Cot_Fecha_Crea), INTERVAL 90 DAY),
           COALESCE(DATE(?), CURDATE())
         )
       ) ASC,
       c.PK_Cot_Cod ASC
     LIMIT ?`,
    [
      baseDateYmd,
      baseDateYmd,
      baseDateYmd,
      Number(horizonDays),
      baseDateYmd,
      Number(horizonDays),
      baseDateYmd,
      Number(horizonDays),
      baseDateYmd,
      Number(horizonDays),
      baseDateYmd,
      Number(horizonDays),
      baseDateYmd,
      baseDateYmd,
      Number(limit),
    ]
  );
  return rows;
}

async function getAlertaPedidosEnRiesgoCount(horizonDays = 7, baseDateYmd = null) {
  const [rows] = await pool.query(
    `SELECT
       SUM(
         CASE
           WHEN base.fechaReferencia IS NULL THEN 1
           ELSE 0
         END
       ) AS totalSinFechaEvento,
       SUM(
         CASE
           WHEN base.fechaReferencia IS NOT NULL
             AND DATEDIFF(base.fechaReferencia, COALESCE(DATE(?), CURDATE())) < 0
           THEN 1 ELSE 0
         END
       ) AS totalVencidos,
       SUM(
         CASE
           WHEN base.fechaReferencia IS NOT NULL
             AND DATEDIFF(base.fechaReferencia, COALESCE(DATE(?), CURDATE())) BETWEEN 0 AND ?
           THEN 1 ELSE 0
         END
       ) AS totalPorVencer,
       SUM(
         CASE
           WHEN base.fechaReferencia IS NULL
             OR (
               base.fechaReferencia IS NOT NULL
               AND DATEDIFF(base.fechaReferencia, COALESCE(DATE(?), CURDATE())) <= ?
             )
           THEN 1 ELSE 0
         END
       ) AS totalPedidos
     FROM (
       SELECT
         p.PK_P_Cod AS pedidoId,
         COALESCE(ev.primerFecha, p.P_FechaEvento) AS fechaReferencia
       FROM T_Pedido p
       LEFT JOIN (
         SELECT FK_P_Cod AS pedidoId, MIN(PE_Fecha) AS primerFecha
         FROM T_PedidoEvento
         GROUP BY FK_P_Cod
       ) ev ON ev.pedidoId = p.PK_P_Cod
       LEFT JOIN T_Proyecto pr ON pr.FK_P_Cod = p.PK_P_Cod
       WHERE pr.PK_Pro_Cod IS NULL
     ) base`,
    [baseDateYmd, baseDateYmd, Number(horizonDays), baseDateYmd, Number(horizonDays)]
  );
  return rows[0] || {
    totalSinFechaEvento: 0,
    totalVencidos: 0,
    totalPorVencer: 0,
    totalPedidos: 0,
  };
}

async function listAlertaPedidosEnRiesgo(limit = 25, horizonDays = 7, baseDateYmd = null) {
  const [rows] = await pool.query(
    `SELECT
       p.PK_P_Cod AS pedidoId,
       p.P_Nombre_Pedido AS pedido,
       DATE_FORMAT(COALESCE(ev.primerFecha, p.P_FechaEvento), '%Y-%m-%d') AS fechaReferencia,
       DATEDIFF(
         COALESCE(ev.primerFecha, p.P_FechaEvento),
         COALESCE(DATE(?), CURDATE())
       ) AS diasParaEvento,
       ep.EP_Nombre AS estadoPedido
     FROM T_Pedido p
     LEFT JOIN (
       SELECT FK_P_Cod AS pedidoId, MIN(PE_Fecha) AS primerFecha
       FROM T_PedidoEvento
       GROUP BY FK_P_Cod
     ) ev ON ev.pedidoId = p.PK_P_Cod
     LEFT JOIN T_Estado_Pedido ep ON ep.PK_EP_Cod = p.FK_EP_Cod
     LEFT JOIN T_Proyecto pr ON pr.FK_P_Cod = p.PK_P_Cod
     WHERE pr.PK_Pro_Cod IS NULL
       AND COALESCE(ev.primerFecha, p.P_FechaEvento) IS NOT NULL
       AND DATEDIFF(
         COALESCE(ev.primerFecha, p.P_FechaEvento),
         COALESCE(DATE(?), CURDATE())
       ) <= ?
     ORDER BY diasParaEvento ASC, p.PK_P_Cod ASC
     LIMIT ?`,
    [baseDateYmd, baseDateYmd, Number(horizonDays), Number(limit)]
  );
  return rows;
}

async function getCapacidadStaffTotal() {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS totalStaff
     FROM T_Empleados e
     WHERE e.FK_Estado_Emp_Cod = 1`
  );
  return rows[0] || { totalStaff: 0 };
}

async function getCapacidadEquipoTotal() {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS totalEquipos
     FROM T_Equipo eq
     WHERE eq.FK_EE_Cod = 1`
  );
  return rows[0] || { totalEquipos: 0 };
}

async function listUsoStaffPorDia(fromYmd, toYmd) {
  const [rows] = await pool.query(
    `SELECT
       DATE(pd.PD_Fecha) AS fecha,
       COUNT(*) AS asignacionesStaff,
       COUNT(DISTINCT pde.FK_Em_Cod) AS staffUnicoAsignado
     FROM T_ProyectoDiaEmpleado pde
     INNER JOIN T_ProyectoDia pd ON pd.PK_PD_Cod = pde.FK_PD_Cod
     WHERE pde.FK_Em_Cod IS NOT NULL
       AND DATE(pd.PD_Fecha) BETWEEN ? AND ?
     GROUP BY DATE(pd.PD_Fecha)
     ORDER BY DATE(pd.PD_Fecha) ASC`,
    [fromYmd, toYmd]
  );
  return rows;
}

async function listUsoEquipoPorDia(fromYmd, toYmd) {
  const [rows] = await pool.query(
    `SELECT
       DATE(pd.PD_Fecha) AS fecha,
       COUNT(*) AS asignacionesEquipo,
       COUNT(DISTINCT pdq.FK_Eq_Cod) AS equipoUnicoAsignado,
       SUM(CASE WHEN IFNULL(pdq.PDQ_Devuelto, 0) = 0 THEN 1 ELSE 0 END) AS equipoPendienteDevolucion
     FROM T_ProyectoDiaEquipo pdq
     INNER JOIN T_ProyectoDia pd ON pd.PK_PD_Cod = pdq.FK_PD_Cod
     WHERE pdq.FK_Eq_Cod IS NOT NULL
       AND DATE(pd.PD_Fecha) BETWEEN ? AND ?
     GROUP BY DATE(pd.PD_Fecha)
     ORDER BY DATE(pd.PD_Fecha) ASC`,
    [fromYmd, toYmd]
  );
  return rows;
}

async function getAlertaProyectoListoSinLinkFinalCount() {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS totalProyectos
     FROM T_Proyecto p
     LEFT JOIN T_Estado_Proyecto ep ON ep.PK_EPro_Cod = p.Pro_Estado
     WHERE ep.EPro_Nombre = 'Listo para entrega'
       AND (
         p.Pro_Entrega_Final_Enlace IS NULL
         OR TRIM(p.Pro_Entrega_Final_Enlace) = ''
       )`
  );
  return rows[0] || { totalProyectos: 0 };
}

async function listAlertaProyectoListoSinLinkFinal(limit = 25) {
  const [rows] = await pool.query(
    `SELECT
       p.PK_Pro_Cod AS proyectoId,
       p.Pro_Nombre AS proyecto,
       ep.EPro_Nombre AS estadoProyecto,
       DATE_FORMAT(p.created_at, '%Y-%m-%d') AS fechaCreacion,
       p.FK_P_Cod AS pedidoId
     FROM T_Proyecto p
     LEFT JOIN T_Estado_Proyecto ep ON ep.PK_EPro_Cod = p.Pro_Estado
     WHERE ep.EPro_Nombre = 'Listo para entrega'
       AND (
         p.Pro_Entrega_Final_Enlace IS NULL
         OR TRIM(p.Pro_Entrega_Final_Enlace) = ''
       )
     ORDER BY p.updated_at DESC, p.PK_Pro_Cod DESC
     LIMIT ?`,
    [Number(limit)]
  );
  return rows;
}

async function getAlertaDiasSuspendidosPorReprogramarCount() {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS totalDias
     FROM T_ProyectoDia pd
     INNER JOIN T_Estado_Proyecto_Dia epd ON epd.PK_EPD_Cod = pd.FK_EPD_Cod
     WHERE epd.EPD_Nombre = 'Suspendido'`
  );
  return rows[0] || { totalDias: 0 };
}

async function listAlertaDiasSuspendidosPorReprogramar(limit = 25) {
  const [rows] = await pool.query(
    `SELECT
       pd.PK_PD_Cod AS diaId,
       DATE_FORMAT(pd.PD_Fecha, '%Y-%m-%d') AS fecha,
       p.PK_Pro_Cod AS proyectoId,
       p.Pro_Nombre AS proyecto,
       epd.EPD_Nombre AS estadoDia,
       p.FK_P_Cod AS pedidoId
     FROM T_ProyectoDia pd
     INNER JOIN T_Proyecto p ON p.PK_Pro_Cod = pd.FK_Pro_Cod
     INNER JOIN T_Estado_Proyecto_Dia epd ON epd.PK_EPD_Cod = pd.FK_EPD_Cod
     WHERE epd.EPD_Nombre = 'Suspendido'
     ORDER BY pd.PD_Fecha ASC, pd.PK_PD_Cod ASC
     LIMIT ?`,
    [Number(limit)]
  );
  return rows;
}

module.exports = {
  listCotizacionesPorEstado,
  listPedidosPorEstado,
  listProyectosPorEstado,
  getEmbudoCoreCounts,
  getAntiguedadFaseCotizacionSinPedido,
  getAntiguedadFasePedidoSinProyecto,
  getAntiguedadFaseProyectoActivo,
  listCuellosBotellaCotizaciones,
  listCuellosBotellaPedidos,
  listCuellosBotellaProyectos,
  listAgendaProyectoDias,
  listAgendaBloquesByDiaIds,
  listAgendaEmpleadosByDiaIds,
  listAgendaEquiposByDiaIds,
  listAgendaPedidosEventos,
  getResumenCobrosDelDia,
  getAlertaCotizacionesPorExpirarCount,
  listAlertaCotizacionesPorExpirar,
  getAlertaPedidosEnRiesgoCount,
  listAlertaPedidosEnRiesgo,
  getCapacidadStaffTotal,
  getCapacidadEquipoTotal,
  listUsoStaffPorDia,
  listUsoEquipoPorDia,
  getAlertaProyectoListoSinLinkFinalCount,
  listAlertaProyectoListoSinLinkFinal,
  getAlertaDiasSuspendidosPorReprogramarCount,
  listAlertaDiasSuspendidosPorReprogramar,
  getProyectosDiaResumen,
  listProyectosDiaPorEstado,
  listProyectosDiaDetalle,
  getAlertaDevolucionesPendientesCount,
  listAlertaDevolucionesPendientes,
  getAlertaDiasSuspendidosCanceladosCount,
  listAlertaDiasSuspendidosCancelados,
  getAlertaRetrasosCount,
  listAlertaRetrasos,
};
