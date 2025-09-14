// src/modules/evento/evento.schemas.js
/**
 * @swagger
 * components:
 *   schemas:
 *     Evento:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: "Matrimonio - Sesión Fotográfica"
 *       required: [id, nombre]
 *
 *     EventoCreate:
 *       type: object
 *       required: [nombre]
 *       properties:
 *         nombre:
 *           type: string
 *           example: "Boda - Cobertura completa"
 *
 *     EventoUpdate:
 *       type: object
 *       description: Al menos un campo requerido
 *       properties:
 *         nombre:
 *           type: string
 *           example: "Boda - Sesión + Recepción"
 *       anyOf:
 *         - required: [nombre]
 *
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Evento no encontrado"
 */
module.exports = {};
