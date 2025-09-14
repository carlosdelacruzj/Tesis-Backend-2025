/**
 * @swagger
 * components:
 *   schemas:
 *     Servicio:
 *       type: object
 *       properties:
 *         id:     { type: integer }
 *         nombre: { type: string }
 *       required: [id, nombre]
 *       example:
 *         id: 2
 *         nombre: "Video"
 *
 *     ServicioCreate:
 *       type: object
 *       required: [nombre]
 *       properties:
 *         nombre: { type: string }
 *       example:
 *         nombre: "Drone"
 *
 *     ServicioUpdate:
 *       type: object
 *       description: Campos opcionales; al menos uno requerido.
 *       properties:
 *         nombre: { type: string }
 *       anyOf:
 *         - required: [nombre]
 *       example:
 *         nombre: "Photobooth"
 */
module.exports = {};
