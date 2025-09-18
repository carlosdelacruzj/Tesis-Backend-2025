const { Router } = require("express");
const ctrl = require("./voucher.controller");
const router = Router();

/**
 * @swagger
 * /voucher/consulta/getAllPedidoVoucher/{idEstado}:
 *   get:
 *     tags: [voucher]
 *     summary: Listar pedidos por estado del voucher
 *     parameters:
 *       - in: path
 *         name: idEstado
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '200': { description: OK }
 *       '400': { description: idEstado inválido }
 */
router.get("/consulta/getAllPedidoVoucher/:idEstado", ctrl.getAllPedidoVoucher);

/**
 * @swagger
 * /voucher/consulta/getAllVoucherByPedido/{idPedido}:
 *   get:
 *     tags: [voucher]
 *     summary: Listar vouchers por pedido
 *     parameters:
 *       - in: path
 *         name: idPedido
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '200': { description: OK }
 *       '400': { description: idPedido inválido }
 */
router.get("/consulta/getAllVoucherByPedido/:idPedido", ctrl.getAllVoucherByPedido);

/**
 * @swagger
 * /voucher/consulta/getVoucherByPedido/{idPedido}:
 *   get:
 *     tags: [voucher]
 *     summary: Obtener voucher (único) por pedido
 *     parameters:
 *       - in: path
 *         name: idPedido
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '200': { description: OK }
 *       '404': { description: No encontrado }
 */
router.get("/consulta/getVoucherByPedido/:idPedido", ctrl.getVoucherByPedido);

/**
 * @swagger
 * /voucher/registro/postVoucher:
 *   post:
 *     tags: [voucher]
 *     summary: Registrar voucher
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/VoucherCreate' }
 *     responses:
 *       '201': { description: Creado }
 *       '400': { description: Datos inválidos }
 */
router.post("/registro/postVoucher", ctrl.postVoucher);
/**
 * @swagger
 * /voucher/consulta/getAllMetodoPago:
 *   get:
 *     tags: [voucher]
 *     summary: Listar métodos de pago
 *     responses: { '200': { description: OK } }
 */
router.get("/consulta/getAllMetodoPago", ctrl.getAllMetodoPago);

/**
 * @swagger
 * /voucher/consulta/getAllEstadoVoucher:
 *   get:
 *     tags: [voucher]
 *     summary: Listar estados de voucher
 *     responses: { '200': { description: OK } }
 */
router.get("/consulta/getAllEstadoVoucher", ctrl.getAllEstadoVoucher);

module.exports = router;
