/**
 * @swagger
 * components:
 *   schemas:
 *     Contrato:
 *       type: object
 *       properties:
 *         idContrato: { type: integer }
 *         pedidoId:   { type: integer }
 *         fecha:      { type: string, format: date }
 *         estado:     { type: string }
 *         total:      { type: number, format: float }
 *       example:
 *         idContrato: 501
 *         pedidoId: 120
 *         fecha: "2025-08-01"
 *         estado: "Vigente"
 *         total: 1450.50
 */
module.exports = {};
