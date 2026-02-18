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
 *         formSchema:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EventoFieldSchema'
 *       required: [id, nombre]
 *
 *     EventoFieldSchema:
 *       type: object
 *       required: [key, label, type, required, active, order]
 *       properties:
 *         key:
 *           type: string
 *           example: "novio_nombre"
 *         label:
 *           type: string
 *           example: "Nombre del novio"
 *         type:
 *           type: string
 *           enum: [text, textarea, number, date, select, checkbox]
 *           example: "text"
 *         required:
 *           type: boolean
 *           example: true
 *         active:
 *           type: boolean
 *           example: true
 *         order:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *         placeholder:
 *           type: string
 *           nullable: true
 *           example: "Ej. Carlos"
 *         helpText:
 *           type: string
 *           nullable: true
 *           example: "Nombre completo"
 *         options:
 *           type: array
 *           items: { type: string }
 *           example: ["Civil", "Religiosa"]
 *
 *     EventoSchemaUpdate:
 *       type: object
 *       required: [formSchema]
 *       properties:
 *         formSchema:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EventoFieldSchema'
 *
 *     EventoSchemaResponse:
 *       type: object
 *       properties:
 *         eventoId:
 *           type: integer
 *           example: 1
 *         formSchema:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EventoFieldSchema'
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
 *         formSchema:
 *           type: array
 *           nullable: true
 *           items:
 *             $ref: '#/components/schemas/EventoFieldSchema'
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
 *         formSchema:
 *           type: array
 *           nullable: true
 *           items:
 *             $ref: '#/components/schemas/EventoFieldSchema'
 *       anyOf:
 *         - required: [nombre]
 *         - required: [iconUrl]
 *         - required: [formSchema]
 *
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Evento no encontrado"
 */
module.exports = {};
