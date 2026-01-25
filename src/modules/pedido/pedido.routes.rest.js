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
