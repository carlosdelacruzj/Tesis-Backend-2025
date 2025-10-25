/**
 * @swagger
 * components:
 *   schemas:
 *     TipoEquipo:
 *       type: object
 *       properties:
 *         idTipoEquipo: { type: integer }
 *         nombre: { type: string, maxLength: 60 }
 *       required: [idTipoEquipo, nombre]
 *       example:
 *         idTipoEquipo: 7
 *         nombre: "Cámara"
 *
 *     TipoEquipoCreate:
 *       type: object
 *       required: [nombre]
 *       properties:
 *         nombre: { type: string, maxLength: 60 }
 *       example:
 *         nombre: "Iluminación"
 *
 *     TipoEquipoUpdate:
 *       type: object
 *       required: [nombre]
 *       properties:
 *         nombre: { type: string, maxLength: 60 }
 *       example:
 *         nombre: "Iluminación LED"
 */

module.exports = {};
