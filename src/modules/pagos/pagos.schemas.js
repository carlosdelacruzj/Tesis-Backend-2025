/**
 * @swagger
 * components:
 *   schemas:
 *     PedidoLite:
 *       type: object
 *       properties:
 *         IdPed:
 *           type: integer
 *         Nombre:
 *           type: string
 *         Fecha:
 *           type: string
 *           format: date
 *       example:
 *         IdPed: 42
 *         Nombre: "Boda Renzo y Pablo"
 *         Fecha: "2025-09-20"
 *
 *     ResumenPago:
 *       type: object
 *       properties:
 *         CostoTotal:
 *           type: number
 *           format: double
 *         MontoAbonado:
 *           type: number
 *           format: double
 *         SaldoPendiente:
 *           type: number
 *           format: double
 *       example:
 *         CostoTotal: 2500
 *         MontoAbonado: 1000
 *         SaldoPendiente: 1500
 *
 *     MetodoPago:
 *       type: object
 *       properties:
 *         ID:
 *           type: integer
 *         Nombre:
 *           type: string
 *       example:
 *         ID: 2
 *         Nombre: "Transferencia"
 *
 *     VoucherVM:
 *       type: object
 *       properties:
 *         Codigo:
 *           type: integer
 *         Fecha:
 *           type: string
 *           format: date
 *         Monto:
 *           type: number
 *           format: double
 *         MetodoPago:
 *           type: string
 *         Link:
 *           type: string
 *       example:
 *         Codigo: 1005
 *         Fecha: "2025-09-22"
 *         Monto: 400
 *         MetodoPago: "Yape/Plin"
 *         Link: "/uploads/vouchers/v_1005.jpg"
 *
 *     PagoCreate:
 *       type: object
 *       required: [pedidoId, monto, metodoPagoId]
 *       properties:
 *         file:
 *           type: string
 *           format: binary
 *           description: Imagen del voucher
 *         pedidoId:
 *           type: integer
 *           description: Id del pedido
 *         monto:
 *           type: number
 *           format: double
 *           description: Monto abonado
 *         metodoPagoId:
 *           type: integer
 *           description: FK de método de pago
 *         estadoVoucherId:
 *           type: integer
 *           description: FK de estado de voucher (default 2 = Aprobado)
 *           default: 2
 *         fecha:
 *           type: string
 *           format: date
 *           description: Fecha del voucher (opcional)
 */
module.exports = {};
