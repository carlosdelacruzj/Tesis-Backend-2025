/**
 * @swagger
 * components:
 *   schemas:
 *     PedidoCreate:
 *       type: object
 *       required: [pedido, eventos, items]
 *       properties:
 *         pedido:
 *           type: object
 *           required: [empleadoId, fechaCreacion, estadoPedidoId, estadoPagoId]
 *           properties:
 *             clienteId:
 *               type: integer
 *               nullable: true
 *               example: 1
 *             cliente:
 *               type: object
 *               properties:
 *                 documento:
 *                   type: string
 *                   example: "47654321"
 *             empleadoId:
 *               type: integer
 *               example: 1
 *             fechaCreacion:
 *               type: string
 *               format: date
 *               example: "2025-09-20"
 *             observaciones:
 *               type: string
 *               example: "Observaciones del pedido"
 *             estadoPedidoId:
 *               type: integer
 *               example: 1
 *             estadoPagoId:
 *               type: integer
 *               example: 1
 *             idTipoEvento:
 *               type: integer
 *               nullable: true
 *               example: 3
 *             nombrePedido:
 *               type: string
 *               example: "Boda de Renzo y Pablo"
 *         eventos:
 *           type: array
 *           minItems: 1
 *           items:
 *             type: object
 *             required: [fecha]
 *             properties:
 *               clientEventKey:
 *                 type: integer
 *                 example: 1
 *               fecha:
 *                 type: string
 *                 format: date
 *                 example: "2025-09-20"
 *               hora:
 *                 type: string
 *                 pattern: '^\\d{2}:\\d{2}(:\\d{2})?$'
 *                 example: "09:00:00"
 *               ubicacion:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Casa del Novio"
 *               direccion:
 *                 type: string
 *                 maxLength: 150
 *                 example: "Calle Piura Mz B4 Lote 10"
 *               notas:
 *                 type: string
 *                 maxLength: 255
 *                 example: "Llegar 15 min antes"
 *         items:
 *           type: array
 *           minItems: 1
 *           items:
 *             type: object
 *             required: [nombre, precioUnit]
 *             properties:
 *               exsId:
 *                 type: integer
 *                 nullable: true
 *                 example: 11
 *               idEventoServicio:
 *                 type: integer
 *                 nullable: true
 *                 example: 11
 *               eventoId:
 *                 type: integer
 *                 nullable: true
 *                 example: 3
 *               servicioId:
 *                 type: integer
 *                 nullable: true
 *                 example: 2
 *               eventoCodigo:
 *                 type: integer
 *                 nullable: true
 *                 example: 1
 *               moneda:
 *                 type: string
 *                 default: "USD"
 *                 enum: ["USD","PEN"]
 *               nombre:
 *                 type: string
 *                 maxLength: 120
 *                 example: "Foto boda full day + álbum impreso"
 *               descripcion:
 *                 type: string
 *                 maxLength: 255
 *                 example: "Paquete 2h + 30 fotos editadas"
 *               precioUnit:
 *                 type: number
 *                 example: 2500
 *               cantidad:
 *                 type: number
 *                 default: 1
 *                 example: 1
 *               descuento:
 *                 type: number
 *                 default: 0
 *                 example: 0
 *               recargo:
 *                 type: number
 *                 default: 0
 *                 example: 0
 *               horas:
 *                 type: number
 *                 example: 6
 *               personal:
 *                 type: integer
 *                 nullable: true
 *                 example: 3
 *               fotosImpresas:
 *                 type: integer
 *                 nullable: true
 *                 example: 100
 *               trailerMin:
 *                 type: integer
 *                 nullable: true
 *                 example: 2
 *               filmMin:
 *                 type: integer
 *                 nullable: true
 *                 example: 25
 *               notas:
 *                 type: string
 *                 maxLength: 150
 *                 example: "nota del ítem"
 *
 *     PedidoUpdate:
 *       type: object
 *       description: >
 *         Update compuesto. Si envías `eventos` o `items` como **null**, no se tocan.
 *         Si los envías como **[]**, se vacían (se borran en BD). En `eventos[]` y `items[]`,
 *         si incluyes `id` se actualiza; si `id` es null/omiso, se inserta.
 *       properties:
 *         pedido:
 *           type: object
 *           required: [id]
 *           properties:
 *             id:
 *               type: integer
 *               example: 123
 *             clienteId:
 *               type: integer
 *               nullable: true
 *               example: 1
 *             cliente:
 *               type: object
 *               properties:
 *                 documento:
 *                   type: string
 *                   example: "47654321"
 *             empleadoId:
 *               type: integer
 *               example: 1
 *             fechaCreacion:
 *               type: string
 *               format: date
 *               example: "2025-09-20"
 *             observaciones:
 *               type: string
 *               example: "Observaciones del pedido"
 *             estadoPedidoId:
 *               type: integer
 *               example: 1
 *             estadoPagoId:
 *               type: integer
 *               example: 1
 *             idTipoEvento:
 *               type: integer
 *               nullable: true
 *               example: 3
 *             nombrePedido:
 *               type: string
 *               example: "Boda de Renzo y Pablo"
 *         eventos:
 *           type: array
 *           nullable: true
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 nullable: true
 *                 example: 555
 *               clientEventKey:
 *                 type: integer
 *                 example: 1
 *               fecha:
 *                 type: string
 *                 format: date
 *                 example: "2025-09-20"
 *               hora:
 *                 type: string
 *                 pattern: '^\\d{2}:\\d{2}(:\\d{2})?$'
 *                 example: "09:00:00"
 *               ubicacion:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Casa del Novio"
 *               direccion:
 *                 type: string
 *                 maxLength: 150
 *                 example: "Calle Piura Mz B4 Lote 10"
 *               notas:
 *                 type: string
 *                 maxLength: 255
 *                 example: "Llegar 15 min antes"
 *         items:
 *           type: array
 *           nullable: true
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 nullable: true
 *                 example: 777
 *               exsId:
 *                 type: integer
 *                 nullable: true
 *                 example: 11
 *               idEventoServicio:
 *                 type: integer
 *                 nullable: true
 *                 example: 11
 *               eventoId:
 *                 type: integer
 *                 nullable: true
 *                 example: 3
 *               servicioId:
 *                 type: integer
 *                 nullable: true
 *                 example: 2
 *               eventoCodigo:
 *                 type: integer
 *                 nullable: true
 *                 example: 1
 *               moneda:
 *                 type: string
 *                 enum: ["USD","PEN"]
 *                 example: "USD"
 *               nombre:
 *                 type: string
 *                 maxLength: 120
 *                 example: "Foto boda full day + álbum impreso"
 *               descripcion:
 *                 type: string
 *                 maxLength: 255
 *                 example: "Paquete 2h + 30 fotos editadas"
 *               precioUnit:
 *                 type: number
 *                 example: 2500
 *               cantidad:
 *                 type: number
 *                 example: 1
 *               descuento:
 *                 type: number
 *                 example: 0
 *               recargo:
 *                 type: number
 *                 example: 0
 *               horas:
 *                 type: number
 *                 example: 6
 *               personal:
 *                 type: integer
 *                 nullable: true
 *                 example: 3
 *               fotosImpresas:
 *                 type: integer
 *                 nullable: true
 *                 example: 100
 *               trailerMin:
 *                 type: integer
 *                 nullable: true
 *                 example: 2
 *               filmMin:
 *                 type: integer
 *                 nullable: true
 *                 example: 25
 *               notas:
 *                 type: string
 *                 maxLength: 150
 *                 example: "nota del ítem"
 *
 *     PedidoCreateResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "Registro exitoso"
 *         pedidoId:
 *           type: integer
 *           example: 123
 *
 *     PedidoIndexItem:
 *       type: object
 *       additionalProperties: true
 *       example:
 *         id: 101
 *         cliente: "Juan Pérez"
 *         estado: "Pendiente"
 *         fechaEvento: "2025-09-17"
 *
 *     PedidoLastEstado:
 *       type: object
 *       additionalProperties: true
 *       example:
 *         idPedido: 101
 *         estado: "Confirmado"
 *         fecha: "2025-09-13T10:22:00Z"
 */
module.exports = {};
