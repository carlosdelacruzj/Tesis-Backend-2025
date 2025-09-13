/**
 * @swagger
 * components:
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         message: { type: string }
 *       example:
 *         message: "Ocurrió un error inesperado"
 *
 *     Cliente:
 *       type: object
 *       properties:
 *         idCliente: { type: integer }
 *         nombre:    { type: string }
 *         apellido:  { type: string }
 *         correo:    { type: string, format: email }
 *         numDoc:    { type: string }
 *         celular:   { type: string }
 *         direccion: { type: string }
 *       required: [idCliente, nombre]
 *       example:
 *         idCliente: 101
 *         nombre: "Katy"
 *         apellido: "Vergaray"
 *         correo: "katy@example.com"
 *         numDoc: "12345678"
 *         celular: "999888777"
 *         direccion: "Av. Siempre Viva 123"
 *
 *     ClienteCreate:
 *       type: object
 *       required: [nombre]
 *       properties:
 *         nombre:    { type: string }
 *         apellido:  { type: string }
 *         correo:    { type: string, format: email }
 *         numDoc:    { type: string }
 *         celular:   { type: string }
 *         direccion: { type: string }
 *       example:
 *         nombre: "Bruno"
 *         apellido: "Silupu"
 *         correo: "bruno@example.com"
 *         numDoc: "70443316"
 *         celular: "99876533"
 *         direccion: "Calle Falsa 123"
 *
 *     ClienteUpdate:
 *       type: object
 *       description: Campos opcionales; al menos uno requerido.
 *       properties:
 *         correo:    { type: string, format: email }
 *         celular:   { type: string }
 *         direccion: { type: string }
 *       anyOf:
 *         - required: [correo]
 *         - required: [celular]
 *         - required: [direccion]
 *       example:
 *         correo: "nuevo@example.com"
 *         celular: "946202445"
 *         direccion: "su casita"
 */

// (Opcional) si quieres exportar algo para validación en runtime, puedes dejar:
module.exports = {};
