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
 *           example: "Boda"
 *         iconUrl:
 *           type: string
 *           nullable: true
 *           example: "assets/images/boda.jpg"
 *       required: [id, nombre]
 *
 *     EventoCreate:
 *       type: object
 *       required: [nombre]
 *       properties:
 *         nombre:
 *           type: string
 *           example: "Boda"
 *         iconUrl:
 *           type: string
 *           nullable: true
 *           example: "assets/images/boda.jpg"
 *
 *     EventoUpdate:
 *       type: object
 *       description: Al menos un campo requerido
 *       properties:
 *         nombre:
 *           type: string
 *           example: "Boda Gala"
 *         iconUrl:
 *           type: string
 *           nullable: true
 *           example: "assets/images/boda-gala.jpg"
 *       anyOf:
 *         - required: [nombre]
 *         - required: [iconUrl]
 *
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Evento no encontrado"
 */
module.exports = {};
