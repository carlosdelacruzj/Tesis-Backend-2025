/**
 * @swagger
 * components:
 *   schemas:
 *     Marca:
 *       type: object
 *       properties:
 *         idMarca: { type: integer }
 *         nombre: { type: string, maxLength: 100 }
 *       required: [idMarca, nombre]
 *       example:
 *         idMarca: 15
 *         nombre: "Canon"
 *
 *     MarcaCreate:
 *       type: object
 *       required: [nombre]
 *       properties:
 *         nombre: { type: string, maxLength: 100 }
 *       example:
 *         nombre: "Sony"
 *
 *     MarcaUpdate:
 *       type: object
 *       required: [nombre]
 *       properties:
 *         nombre: { type: string, maxLength: 100 }
 *       example:
 *         nombre: "Sony Professional"
 */

module.exports = {};
