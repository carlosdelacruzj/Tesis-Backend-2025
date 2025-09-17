/**
 * @swagger
 * components:
 *   schemas:
 *     PedidoCreate:
 *       type: object
 *       required: [ExS, doc, fechaCreate, fechaEvent, horaEvent, CodEmp, Direccion]
 *       properties:
 *         ExS:         { type: integer }
 *         doc:         { type: string }
 *         fechaCreate: { type: string, format: date }
 *         fechaEvent:  { type: string, format: date }
 *         horaEvent:   { type: string, format: time }
 *         CodEmp:      { type: integer }
 *         Direccion:   { type: string }
 *
 *     PedidoUpdate:
 *       type: object
 *       required: [estadoPedido, fechaEvent, horaEvent, lugar, empleado, estadoPago]
 *       properties:
 *         estadoPedido: { type: integer }
 *         fechaEvent:   { type: string, format: date }
 *         horaEvent:    { type: string, format: time }
 *         lugar:        { type: string }
 *         empleado:     { type: integer }
 *         estadoPago:   { type: integer }
 */
module.exports = {};
