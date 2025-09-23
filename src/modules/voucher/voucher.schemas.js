/**
 * @swagger
 * components:
 *   schemas:
 *     Voucher:
 *       type: object
 *       properties:
 *         idVoucher:     { type: integer }
 *         idPedido:      { type: integer }
 *         monto:         { type: number, format: double }
 *         metodoPago:    { type: integer, description: "FK método de pago" }
 *         estadoVoucher: { type: integer, description: "FK estado" }
 *         imagen:        { type: string, description: "URL/filename" }
 *         fechaRegistro: { type: string, format: date }
 *       example:
 *         idVoucher: 5001
 *         idPedido: 120
 *         monto: 150.75
 *         metodoPago: 2
 *         estadoVoucher: 1
 *         imagen: "voucher_120_5001.png"
 *         fechaRegistro: "2025-09-15"

 *     VoucherCreate:
 *       type: object
 *       required: [monto, metodoPago, estadoVoucher, idPedido]
 *       properties:
 *         monto:         { type: number, format: double }
 *         metodoPago:    { type: integer }
 *         estadoVoucher: { type: integer }
 *         imagen:        { type: string }
 *         idPedido:      { type: integer }
 *       example:
 *         monto: 120.50
 *         metodoPago: 1
 *         estadoVoucher: 1
 *         imagen: "voucher_120_2025-09-15.png"
 *         idPedido: 120
 */
module.exports = {};
