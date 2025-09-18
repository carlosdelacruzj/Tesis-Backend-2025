const { Router } = require("express");
const ctrl = require("./pedido.controller");
const router = Router();

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
 *     summary: Listar pedidos index (vista resumida)
 *     responses:
 *       '200': { description: OK }
 */
router.get("/index", ctrl.getIndexPedido);

/**
 * @swagger
 * /pedido/last-estado:
 *   get:
 *     tags: [pedido]
 *     summary: Obtener el último estado de pedido registrado
 *     responses:
 *       '200': { description: OK }
 *       '404': { description: No encontrado }
 */
router.get("/last-estado", ctrl.getLastEstadoPedido);

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
 *       '200': { description: OK }
 *       '404': { description: No encontrado }
 */
router.get("/:id", ctrl.getPedidoById);

/**
 * @swagger
 * /pedido:
 *   post:
 *     tags: [pedido]
 *     summary: Crear un nuevo pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PedidoCreate'
 *     responses:
 *       '201': { description: Creado }
 */
router.post("/", ctrl.createPedido);

/**
 * @swagger
 * /pedido/{id}:
 *   put:
 *     tags: [pedido]
 *     summary: Actualizar un pedido por ID
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
 *       '200': { description: Actualizado }
 */
router.put("/:id", ctrl.updatePedido);

module.exports = router;
