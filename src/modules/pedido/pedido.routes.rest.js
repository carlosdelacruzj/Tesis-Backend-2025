// src/modules/pedido/pedido.routes.rest.js
const { Router } = require("express");
const ctrl = require("./pedido.controller");
const router = Router();

/**
 * @swagger
 * /pedidos:
 * get:
 * tags: [pedido]
 * summary: Listar todos los pedidos
 * responses:
 * '200':
 * description: OK
 */
router.get("/", ctrl.getAllPedidos);

/**
 * @swagger
 * /pedidos/{id}:
 * get:
 * tags: [pedido]
 * summary: Obtener pedido por ID
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * responses:
 * '200':
 * description: OK
 * '404':
 * description: No encontrado
 */
router.get("/:id", ctrl.getPedidoById);

/**
 * @swagger
 * /pedidos:
 * post:
 * tags: [pedido]
 * summary: Crear un nuevo pedido
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/PedidoCreate'
 * responses:
 * '201':
 * description: Creado
 */
router.post("/", ctrl.createPedido);

/**
 * @swagger
 * /pedidos/{id}:
 * put:
 * tags: [pedido]
 * summary: Actualizar un pedido por ID
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/PedidoUpdate'
 * responses:
 * '200':
 * description: Actualizado
 */
router.put("/:id", ctrl.updatePedido);

module.exports = router;