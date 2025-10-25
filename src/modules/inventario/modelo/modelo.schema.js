/**
 * @swagger
 * components:
 *   schemas:
 *     Modelo:
 *       type: object
 *       properties:
 *         idModelo: { type: integer }
 *         nombre: { type: string, maxLength: 100 }
 *         idMarca: { type: integer }
 *         nombreMarca: { type: string }
 *         idTipoEquipo: { type: integer }
 *         nombreTipoEquipo: { type: string }
 *       required: [idModelo, nombre, idMarca, idTipoEquipo]
 *       example:
 *         idModelo: 25
 *         nombre: "EOS R5"
 *         idMarca: 3
 *         nombreMarca: "Canon"
 *         idTipoEquipo: 1
 *         nombreTipoEquipo: "Cámara"
 *
 *     ModeloCreate:
 *       type: object
 *       required: [nombre, idMarca, idTipoEquipo]
 *       properties:
 *         nombre: { type: string, maxLength: 100 }
 *         idMarca: { type: integer }
 *         idTipoEquipo: { type: integer }
 *       example:
 *         nombre: "Alpha 7 IV"
 *         idMarca: 4
 *         idTipoEquipo: 1
 *
 *     ModeloUpdate:
 *       type: object
 *       required: [nombre, idMarca, idTipoEquipo]
 *       properties:
 *         nombre: { type: string, maxLength: 100 }
 *         idMarca: { type: integer }
 *         idTipoEquipo: { type: integer }
 *       example:
 *         nombre: "Alpha 7 IV"
 *         idMarca: 4
 *         idTipoEquipo: 2
 */

module.exports = {};
