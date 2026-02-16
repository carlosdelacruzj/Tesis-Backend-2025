// routes/pedido.routes.rest.js
const express = require("express");
const router = express.Router();
const ctrl = require("./pedido.controller");

/**
 * @swagger
 * /pedido:
 *   get:
 *     tags: [pedido]
 *     summary: Listar todos los pedidos
 *     responses:
 *       '200': { description: OK }
 */
router.get("/", ctrl.getAllPedido);

/**
 * @swagger
 * /pedido/index:
 *   get:
 *     tags: [pedido]
 *     summary: Listado índice de pedidos
 *     responses:
 *       '200': { description: OK }
 */
router.get("/index", ctrl.getIndexPedido);

/**
 * @swagger
 * /pedido/disponibilidad/diaria:
 *   get:
 *     tags: [pedido]
 *     summary: Disponibilidad diaria por rol de personal y tipo de equipo
 *     description: |
 *       Calcula capacidad global disponible para una fecha:
 *       total - reservado en pedidos en estado Contratado/En ejecucion.
 *     parameters:
 *       - in: query
 *         name: fecha
 *         required: true
 *         schema: { type: string, format: date }
 *         description: Fecha a evaluar (YYYY-MM-DD).
 *       - in: query
 *         name: pedidoIdExcluir
 *         required: false
 *         schema: { type: integer }
 *         description: Pedido a excluir del calculo (util al editar un pedido existente).
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fecha: { type: string, format: date }
 *                 resumen:
 *                   type: object
 *                   properties:
 *                     personal:
 *                       type: object
 *                       properties:
 *                         total: { type: number }
 *                         reservado: { type: number }
 *                         disponible: { type: number }
 *                         interno:
 *                           type: object
 *                           properties:
 *                             total: { type: number }
 *                             reservado: { type: number }
 *                             disponible: { type: number }
 *                         freelance:
 *                           type: object
 *                           properties:
 *                             total: { type: number }
 *                             reservado: { type: number }
 *                             disponible: { type: number }
 *                     equipos:
 *                       type: object
 *                       properties:
 *                         total: { type: number }
 *                         reservado: { type: number }
 *                         disponible: { type: number }
 *                 personalPorRol:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       rolId: { type: integer, nullable: true }
 *                       rolNombre: { type: string, nullable: true }
 *                       total: { type: number }
 *                       reservado: { type: number }
 *                       disponible: { type: number }
 *                       interno:
 *                         type: object
 *                         properties:
 *                           total: { type: number }
 *                           reservado: { type: number }
 *                           disponible: { type: number }
 *                       freelance:
 *                         type: object
 *                         properties:
 *                           total: { type: number }
 *                           reservado: { type: number }
 *                           disponible: { type: number }
 *                 equiposPorTipo:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       tipoEquipoId: { type: integer, nullable: true }
 *                       tipoEquipoNombre: { type: string, nullable: true }
 *                       total: { type: number }
 *                       reservado: { type: number }
 *                       disponible: { type: number }
 *                 disponibilidadDia:
 *                   type: object
 *                   properties:
 *                     nivel:
 *                       type: string
 *                       enum: [ALTA, LIMITADA, CRITICA]
 *                     requiereApoyoExterno:
 *                       type: boolean
 *                     motivos:
 *                       type: array
 *                       items: { type: string }
 *                     riesgos:
 *                       type: object
 *                       properties:
 *                         personalCriticoInterno:
 *                           type: string
 *                           enum: [OK, AJUSTADO, INSUFICIENTE]
 *                         equiposCriticosInternos:
 *                           type: string
 *                           enum: [OK, AJUSTADO, INSUFICIENTE]
 *                         equiposSecundariosInternos:
 *                           type: string
 *                           enum: [OK, AJUSTADO, INSUFICIENTE]
 *       '400':
 *         description: Fecha invalida
 */
router.get("/disponibilidad/diaria", ctrl.getDisponibilidadDiaria);

/**
 * @swagger
 * /pedido/{id}/requerimientos:
 *   get:
 *     tags: [pedido]
 *     summary: Requerimientos de personal y equipos por pedido
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '200': { description: OK }
 *       '404': { description: No encontrado }
 */
router.get("/:id/requerimientos", ctrl.getRequerimientos);

/**
 * @swagger
 * /pedido/{id}:
 *   get:
 *     tags: [pedido]
 *     summary: Obtener pedido por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PedidoDetailResponse'
 *       '404': { description: No encontrado }
 */
router.get("/:id", ctrl.getPedidoById);

/**
 * @swagger
 * /pedido/estado/last:
 *   get:
 *     tags: [pedido]
 *     summary: Último estado de pedido
 *     responses:
 *       '200': { description: OK }
 *       '404': { description: No encontrado }
 */
router.get("/estado/last", ctrl.getLastEstadoPedido);

/**
 * @swagger
 * /pedido:
 *   post:
 *     tags: [pedido]
 *     summary: Crear un nuevo pedido (composite)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PedidoCreate'
 *     responses:
 *       '201':
 *         description: Creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PedidoCreateResponse'
 */
router.post("/", ctrl.createPedido);

/**
 * @swagger
 * /pedido/{id}:
 *   put:
 *     tags: [pedido]
 *     summary: Actualizar pedido por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PedidoUpdate'
 *     responses:
 *       '200': { description: OK }
 */
router.put("/:id", ctrl.updatePedido);

/**
 * @swagger
 * /pedido/{id}/contrato/pdf:
 *   post:
 *     tags: [pedido]
 *     summary: Genera el PDF del contrato del pedido
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: false
 *     responses:
 *       200:
 *         description: PDF generado
 *         content:
 *           application/pdf: {}
 */
router.post("/:id/contrato/pdf", ctrl.downloadContratoPdf);

module.exports = router;
