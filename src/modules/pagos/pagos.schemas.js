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
 *         FechaCreacion:
 *           type: string
 *           format: date
 *       example:
 *         IdPed: 42
 *         Nombre: "Boda Renzo y Pablo"
 *         Fecha: "2025-09-20"
 *         FechaCreacion: "2025-09-01"
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
 *     Voucher:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         pedidoId: { type: integer }
 *         monto: { type: number, format: double }
 *         fecha: { type: string, format: date }
 *         metodoPagoId: { type: integer }
 *         metodoPagoNombre: { type: string, nullable: true }
 *         estadoVoucherId: { type: integer }
 *         estadoVoucherNombre: { type: string, nullable: true }
 *         archivoNombre: { type: string, nullable: true }
 *         archivoSize: { type: integer, nullable: true }
 *         archivoMime: { type: string, nullable: true }
 *       example:
 *         id: 25
 *         pedidoId: 12
 *         monto: 450
 *         fecha: "2025-09-25"
 *         metodoPagoId: 2
 *         metodoPagoNombre: "Transferencia"
 *         estadoVoucherId: 2
 *         estadoVoucherNombre: "Aprobado"
 *         archivoNombre: "voucher-25.jpg"
 *         archivoSize: 204800
 *         archivoMime: "image/jpeg"
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
 *           description: FK de estado de voucher (por defecto Aprobado)
 *         fecha:
 *           type: string
 *           format: date
 *           description: Fecha del voucher (opcional)
 *
 *     PagoCreateResponse:
 *       type: object
 *       properties:
 *         Status:
 *           type: string
 *         voucherId:
 *           type: integer
 *           nullable: true
 *       example:
 *         Status: "Voucher registrado"
 *         voucherId: 1234
 *
 *     PagoUpdate:
 *       type: object
 *       properties:
 *         file:
 *           type: string
 *           format: binary
 *           description: Nueva imagen del voucher (opcional)
 *         monto:
 *           type: number
 *           format: double
 *         metodoPagoId:
 *           type: integer
 *         estadoVoucherId:
 *           type: integer
 *         fecha:
 *           type: string
 *           format: date
 *       description: Todos los campos son opcionales; si no se envían se conserva el valor actual.
 */
module.exports = {};
