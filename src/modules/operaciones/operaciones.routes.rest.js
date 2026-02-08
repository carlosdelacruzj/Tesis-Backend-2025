const { Router } = require("express");
const ctrl = require("./operaciones.controller");

const router = Router();

/**
 * @swagger
 * /operaciones/dashboard/kpis:
 *   get:
 *     tags: [operaciones]
 *     summary: KPIs operativos minimos para dashboard
 *     description: |
 *       Incluye:
 *       - Pedidos por estado
 *       - Proyectos por estado
 *       - Proyectos del dia (hoy/manana)
 *       - Alertas (devoluciones pendientes, dias suspendidos/cancelados, retrasos)
 *     responses:
 *       '200':
 *         description: OK
 */
router.get("/dashboard/kpis", ctrl.getKpisOperativosMinimos);

/**
 * @swagger
 * /operaciones/dashboard/resumen:
 *   get:
 *     tags: [operaciones]
 *     summary: Resumen operativo del dashboard (solo agregados)
 *     description: |
 *       Endpoint liviano con KPIs agregados de cotizaciones, pedidos y proyectos.
 *       Incluye embudo core y resumen de alertas para carga rapida del dashboard.
 *     responses:
 *       '200':
 *         description: OK
 */
router.get("/dashboard/resumen", ctrl.getDashboardResumen);

/**
 * @swagger
 * /operaciones/dashboard/alertas:
 *   get:
 *     tags: [operaciones]
 *     summary: Cola de alertas operativas del dashboard
 *     description: |
 *       Incluye alertas accionables:
 *       - proyecto listo para entrega sin link final
 *       - equipos no devueltos
 *       - dia suspendido por reprogramar
 *     responses:
 *       '200':
 *         description: OK
 */
router.get("/dashboard/alertas", ctrl.getDashboardAlertas);

/**
 * @swagger
 * /operaciones/dashboard/capacidad:
 *   get:
 *     tags: [operaciones]
 *     summary: Capacidad operativa por rango de fechas (staff/equipo)
 *     description: |
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
router.get("/dashboard/capacidad", ctrl.getDashboardCapacidad);

/**
 * @swagger
 * /operaciones/agenda:
 *   get:
 *     tags: [operaciones]
 *     summary: Agenda/calendario operativo por rango de fechas
 *     description: |
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
router.get("/agenda", ctrl.getAgendaOperativa);

module.exports = router;
