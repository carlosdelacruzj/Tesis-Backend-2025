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
 *         esOperativoCampo:
 *           type: integer
 *           enum: [0,1]
 *           description: 1 si el cargo del empleado participa en eventos/campo
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
 *         esOperativoCampo: 1
 *
 *     EmpleadoCreate:
 *       type: object
 *       required: [nombre, apellido, correo, celular, documento, direccion]
 *       properties:
 *         nombre:    { type: string }
 *         apellido:  { type: string }
 *         correo:    { type: string, format: email }
 *         celular:   { type: string }
 *         documento:       { type: string }
 *         direccion: { type: string }
 *         autonomo:  { type: integer, nullable: true }
 *         idCargo:     { type: integer, nullable: true }
 *       example:
 *         nombre: "Bruno"
 *         apellido: "Silupu"
 *         correo: "bruno@example.com"
 *         celular: "99876533"
 *         documento: "70443316"
 *         direccion: "Calle Falsa 123"
 *         autonomo: 1
 *         idCargo: 3
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
 *         cargoNombre: { type: string }
 *         esOperativoCampo:
 *           type: integer
 *           enum: [0,1]
 *           description: 1 si el cargo está habilitado para trabajo de campo
 *       example:
 *         idCargo: 2
 *         cargoNombre: "Fotógrafo"
 *         esOperativoCampo: 1
 */
module.exports = {};
