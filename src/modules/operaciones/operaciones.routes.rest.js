const { Router } = require("express");
const ctrl = require("./operaciones.controller");

const router = Router();
const DASHBOARD_HOME_PATH = "/api/v1/operaciones/dashboard/home";
const DASHBOARD_SUNSET = "Wed, 30 Apr 2026 00:00:00 GMT";

function deprecateDashboardEndpoint(req, res, next) {
  res.setHeader("Deprecation", "true");
  res.setHeader("Sunset", DASHBOARD_SUNSET);
  res.setHeader("Link", `<${DASHBOARD_HOME_PATH}>; rel=\"successor-version\"`);
  next();
}

/**
 * @swagger
 * /operaciones/dashboard/kpis:
 *   get:
 *     tags: [operaciones]
 *     deprecated: true
 *     summary: KPIs operativos minimos para dashboard
 *     description: |
 *       DEPRECADO: usar /operaciones/dashboard/home.
 *
 *       Incluye:
 *       - Pedidos por estado
 *       - Proyectos por estado
 *       - Proyectos del dia (hoy/manana)
 *       - Alertas (devoluciones pendientes, dias suspendidos/cancelados, retrasos)
 *     responses:
 *       '200':
 *         description: OK
 */
router.get("/dashboard/kpis", deprecateDashboardEndpoint, ctrl.getKpisOperativosMinimos);

/**
 * @swagger
 * /operaciones/dashboard/resumen:
 *   get:
 *     tags: [operaciones]
 *     deprecated: true
 *     summary: Resumen operativo del dashboard (solo agregados)
 *     description: |
 *       DEPRECADO: usar /operaciones/dashboard/home.
 *
 *       Endpoint liviano con KPIs agregados de cotizaciones, pedidos y proyectos.
 *       Incluye embudo core y resumen de alertas para carga rapida del dashboard.
 *     responses:
 *       '200':
 *         description: OK
 */
router.get("/dashboard/resumen", deprecateDashboardEndpoint, ctrl.getDashboardResumen);

/**
 * @swagger
 * /operaciones/dashboard/alertas:
 *   get:
 *     tags: [operaciones]
 *     deprecated: true
 *     summary: Cola de alertas operativas del dashboard
 *     description: |
 *       DEPRECADO: usar /operaciones/dashboard/home.
 *
 *       Incluye alertas accionables:
 *       - proyecto listo para entrega sin link final
 *       - equipos no devueltos
 *       - dia suspendido por reprogramar
 *     responses:
 *       '200':
 *         description: OK
 */
router.get("/dashboard/alertas", deprecateDashboardEndpoint, ctrl.getDashboardAlertas);

/**
 * @swagger
 * /operaciones/dashboard/capacidad:
 *   get:
 *     tags: [operaciones]
 *     deprecated: true
 *     summary: Capacidad operativa por rango de fechas (staff/equipo)
 *     description: |
 *       DEPRECADO: usar /operaciones/dashboard/home.
 *
 *       Mide la carga diaria de recursos para prevenir sobreasignacion.
 *       Si no se envian fechas, usa el mes actual.
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Fecha inicio (YYYY-MM-DD)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Fecha fin (YYYY-MM-DD)
 *     responses:
 *       '200':
 *         description: OK
 */
router.get("/dashboard/capacidad", deprecateDashboardEndpoint, ctrl.getDashboardCapacidad);

/**
 * @swagger
 * /operaciones/dashboard/home:
 *   get:
 *     tags: [operaciones]
 *     summary: Dashboard operativo integral (resumen + alertas + agenda + capacidad)
 *     description: |
 *       Endpoint unificado para la pantalla principal del dashboard operativo.
 *       Incluye agenda detallada con asignaciones de empleados/equipos y riesgos de saturacion.
 *     parameters:
 *       - in: query
 *         name: agendaDays
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 45
 *         required: false
 *         description: Cantidad de dias a proyectar para la agenda (default 14)
 *     responses:
 *       '200':
 *         description: OK
 */
router.get("/dashboard/home", ctrl.getDashboardHome);

/**
 * @swagger
 * /operaciones/agenda:
 *   get:
 *     tags: [operaciones]
 *     deprecated: true
 *     summary: Agenda/calendario operativo por rango de fechas
 *     description: |
 *       DEPRECADO: usar /operaciones/dashboard/home.
 *
 *       Devuelve proyecto-dias y pedido-eventos para construir agenda/calendario.
 *       Si no se envian fechas, usa el mes actual.
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Fecha inicio (YYYY-MM-DD)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Fecha fin (YYYY-MM-DD)
 *     responses:
 *       '200':
 *         description: OK
 */
router.get("/agenda", deprecateDashboardEndpoint, ctrl.getAgendaOperativa);

module.exports = router;
