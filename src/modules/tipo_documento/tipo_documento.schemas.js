/**
 * @swagger
 * components:
 *   schemas:
 *     TipoDocumento:
 *       type: object
 *       properties:
 *         id:       { type: integer }
 *         codigo:   { type: string }
 *         nombre:   { type: string }
 *         tipoDato: { type: string, enum: [N, A] }
 *         tamMin:   { type: integer }
 *         tamMax:   { type: integer }
 *         activo:   { type: integer }
 *       required: [id, codigo, nombre, tipoDato, tamMin, tamMax, activo]
 *       example:
 *         id: 1
 *         codigo: "DNI"
 *         nombre: "Documento Nacional de Identidad"
 *         tipoDato: "N"
 *         tamMin: 8
 *         tamMax: 8
 *         activo: 1
 */
module.exports = {};
