const { Router } = require("express");
const ctrl = require("./contrato.controller");
const router = Router();

/**
 * @swagger
 * /contrato/consulta/getAllContratos:
 *   get:
 *     tags: [contrato]
 *     summary: Listar todos los contratos
 *     responses:
 *       '200': { description: OK }
 */
router.get("/consulta/getAllContratos", ctrl.getAllContratos);

/**
 * @swagger
 * /contrato/consulta/getAllContratosByPedido/{pedido}:
 *   get:
 *     tags: [contrato]
 *     summary: Listar contratos por ID de pedido
 *     parameters:
 *       - in: path
 *         name: pedido
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '200': { description: OK }
 *       '400': { description: pedido inválido }
 *       '404': { description: Sin resultados }
 */
router.get("/consulta/getAllContratosByPedido/:pedido", ctrl.getAllContratosByPedido);

module.exports = router;
