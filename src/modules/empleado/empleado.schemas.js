/**
 * @swagger
 * components:
 *   schemas:
 *     Empleado:
 *       type: object
 *       properties:
 *         idEmpleado: { type: integer }
 *         nombre:     { type: string }
 *         apellido:   { type: string }
 *         correo:     { type: string, format: email }
 *         doc:        { type: string }
 *         celular:    { type: string }
 *         direccion:  { type: string }
 *         autonomo:   { type: integer, nullable: true, description: "0 = no, 1 = sí" }
 *         cargo:      { type: integer, nullable: true }
 *         estado:     { type: integer, nullable: true }
 *       required: [idEmpleado, nombre]
 *       example:
 *         idEmpleado: 10
 *         nombre: "Katy"
 *         apellido: "Vergaray"
 *         correo: "katy@example.com"
 *         doc: "12345678"
 *         celular: "999888777"
 *         direccion: "Av. Siempre Viva 123"
 *         autonomo: 0
 *         cargo: 2
 *         estado: 1
 *
 *     EmpleadoCreate:
 *       type: object
 *       required: [nombre, apellido, correo, celular, doc, direccion]
 *       properties:
 *         nombre:    { type: string }
 *         apellido:  { type: string }
 *         correo:    { type: string, format: email }
 *         celular:   { type: string }
 *         doc:       { type: string }
 *         direccion: { type: string }
 *         autonomo:  { type: integer, nullable: true }
 *         cargo:     { type: integer, nullable: true }
 *       example:
 *         nombre: "Bruno"
 *         apellido: "Silupu"
 *         correo: "bruno@example.com"
 *         celular: "99876533"
 *         doc: "70443316"
 *         direccion: "Calle Falsa 123"
 *         autonomo: 1
 *         cargo: 3
 *
 *     EmpleadoUpdate:
 *       type: object
 *       description: Campos opcionales; al menos uno requerido.
 *       properties:
 *         correo:    { type: string, format: email }
 *         celular:   { type: string }
 *         direccion: { type: string }
 *         estado:    { type: integer }
 *       anyOf:
 *         - required: [correo]
 *         - required: [celular]
 *         - required: [direccion]
 *         - required: [estado]
 *       example:
 *         correo: "nuevo@example.com"
 *         estado: 1
 *
 *     Cargo:
 *       type: object
 *       properties:
 *         idCargo: { type: integer }
 *         nombre:  { type: string }
 *       example:
 *         idCargo: 2
 *         nombre: "Fotógrafo"
 */
module.exports = {};
