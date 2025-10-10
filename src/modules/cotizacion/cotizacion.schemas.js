/**
 * @swagger
 * components:
 *   schemas:
 *     Cotizacion:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         estado: { type: string, enum: [Borrador, Enviada, Aceptada, Rechazada] }
 *         fechaCreacion: { type: string, format: date-time }
 *         tipoEvento: { type: string }
 *         fechaEvento: { type: string, format: date, nullable: true }
 *         lugar: { type: string, nullable: true }
 *         horasEstimadas: { type: number, format: float, nullable: true }
 *         mensaje: { type: string, nullable: true }
 *         lead:
 *           type: object
 *           properties:
 *             id: { type: integer }
 *             nombre: { type: string }
 *             celular: { type: string, nullable: true }
 *             origen: { type: string, nullable: true }
 *             fechaCreacion: { type: string, format: date-time }
 *     CotizacionCreate:
 *       type: object
 *       required: [lead, cotizacion]
 *       properties:
 *         lead:
 *           type: object
 *           required: [nombre]
 *           properties:
 *             nombre: { type: string, example: "Ana" }
 *             celular: { type: string, example: "999888777" }
 *             origen: { type: string, example: "Web" }
 *         cotizacion:
 *           type: object
 *           required: [tipoEvento]
 *           properties:
 *             tipoEvento: { type: string, example: "Boda" }
 *             fechaEvento: { type: string, format: date }
 *             lugar: { type: string, example: "Miraflores" }
 *             horasEstimadas: { type: number, example: 6 }
 *             mensaje: { type: string, example: "Cobertura completa" }
 *             estado: { type: string, enum: [Borrador, Enviada, Aceptada, Rechazada] }
 *     CotizacionUpdate:
 *       type: object
 *       properties:
 *         lead:
 *           type: object
 *           properties:
 *             nombre: { type: string }
 *             celular: { type: string, nullable: true }
 *             origen: { type: string, nullable: true }
 *         cotizacion:
 *           type: object
 *           properties:
 *             tipoEvento: { type: string }
 *             fechaEvento: { type: string, format: date, nullable: true }
 *             lugar: { type: string, nullable: true }
 *             horasEstimadas: { type: number, format: float, nullable: true }
 *             mensaje: { type: string, nullable: true }
 *             estado: { type: string, enum: [Borrador, Enviada, Aceptada, Rechazada] }
 */

module.exports = {};
