/**
 * @swagger
 * components:
 *   schemas:
 *     LeadConvertRequest:
 *       type: object
 *       required: [correo]
 *       properties:
 *         correo:
 *           type: string
 *           format: email
 *         celular:
 *           type: string
 *           description: Se usa si se va a crear el usuario
 *         nombre:
 *           type: string
 *         apellido:
 *           type: string
 *         numDoc:
 *           type: string
 *           description: DNI (8) o RUC (11) requerido cuando se crea el usuario
 *         direccion:
 *           type: string
 *       example:
 *         correo: lead@example.com
 *         celular: "999123123"
 *         nombre: Carla
 *         apellido: Diaz
 *         numDoc: "71234567"
 *         direccion: "Av Siempre Viva 123"
 *
 *     LeadConvertResponse:
 *       type: object
 *       properties:
 *         usuarioId:
 *           type: integer
 *         clienteId:
 *           type: integer
 *         usuarioAccion:
 *           type: string
 *           enum: [CREADO, REUSADO, ""]
 *         clienteAccion:
 *           type: string
 *           enum: [CREADO, REUSADO, ""]
 *       example:
 *         usuarioId: 10
 *         clienteId: 25
 *         usuarioAccion: CREADO
 *         clienteAccion: CREADO
 */

module.exports = {};
