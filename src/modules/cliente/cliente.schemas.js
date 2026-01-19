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
 *         tipoDocumentoId: { type: integer }
 *         tipoDocumentoCodigo: { type: string }
 *         tipoDocumentoNombre: { type: string }
 *         idEstadoCliente: { type: integer }
 *         estadoCliente: { type: string }
 *         razonSocial: { type: string, nullable: true }
 *         celular:   { type: string }
 *         direccion: { type: string }
 *       required: [idCliente, nombre]
 *       example:
 *         idCliente: 101
 *         nombre: "Katy"
 *         apellido: "Vergaray"
 *         correo: "katy@example.com"
 *         numDoc: "12345678"
 *         tipoDocumentoId: 1
 *         tipoDocumentoCodigo: "DNI"
 *         tipoDocumentoNombre: "Documento Nacional de Identidad"
 *         idEstadoCliente: 1
 *         estadoCliente: "Habilitado"
 *         razonSocial: null
 *         celular: "999888777"
 *         direccion: "Av. Siempre Viva 123"
 *
 *     ClienteCreate:
 *       type: object
 *       required: [nombre, apellido, correo, numDoc, tipoDocumentoId, celular, direccion]
 *       properties:
 *         nombre:    { type: string }
 *         apellido:  { type: string }
 *         correo:    { type: string, format: email }
 *         numDoc:    { type: string }
 *         tipoDocumentoId: { type: integer }
 *         razonSocial: { type: string, nullable: true }
 *         celular:   { type: string }
 *         direccion: { type: string }
 *       example:
 *         nombre: "Bruno"
 *         apellido: "Silupu"
 *         correo: "bruno@example.com"
 *         numDoc: "70443316"
 *         tipoDocumentoId: 1
 *         razonSocial: null
 *         celular: "99876533"
 *         direccion: "Calle Falsa 123"
 *
 *     ClienteUpdate:
 *       type: object
 *       description: Campos opcionales; al menos uno requerido.
 *       properties:
 *         nombre:    { type: string }
 *         apellido:  { type: string }
 *         correo:    { type: string, format: email }
 *         celular:   { type: string }
 *         direccion: { type: string }
 *         razonSocial: { type: string }
 *       anyOf:
 *         - required: [nombre]
 *         - required: [apellido]
 *         - required: [correo]
 *         - required: [celular]
 *         - required: [direccion]
 *         - required: [razonSocial]
 *       example:
 *         nombre: "Katy"
 *         apellido: "Vergaray"
 *         correo: "nuevo@example.com"
 *         celular: "946202445"
 *         direccion: "su casita"
 *         razonSocial: "Katy SAC"
 *
 *     # === NUEVO ===
 *     ClienteAutocompleteItem:
 *       type: object
 *       description: Item devuelto por /clientes/buscar (autocompletado).
 *       properties:
 *         idCliente:     { type: integer }
 *         codigoCliente: { type: string, description: "Código formateado: CLI-000001" }
 *         nombre:        { type: string }
 *         apellido:      { type: string }
 *         correo:        { type: string, format: email }
 *         celular:       { type: string }
 *         doc:           { type: string, description: "DNI/RUC u otro documento" }
 *         direccion:     { type: string }
 *         razonSocial:   { type: string, nullable: true }
 *         tipoDocumentoId: { type: integer }
 *         tipoDocumentoCodigo: { type: string }
 *         tipoDocumentoNombre: { type: string }
 *       required: [idCliente, nombre]
 *       example:
 *         idCliente: 12
 *         codigoCliente: "CLI-000012"
 *         nombre: "María"
 *         apellido: "García"
 *         correo: "nuevo@example.com"
 *         celular: "946202445"
 *         doc: "47651234"
 *         direccion: "su casita 2"
 *         razonSocial: "Mi Empresa SAC"
 *         tipoDocumentoId: 1
 *         tipoDocumentoCodigo: "DNI"
 *         tipoDocumentoNombre: "Documento Nacional de Identidad"
 *
 *     ClientesAutocompleteResponse:
 *       type: array
 *       description: Lista de coincidencias para autocompletado.
 *       items:
 *         $ref: '#/components/schemas/ClienteAutocompleteItem'
 *
 *     ClienteEstadoUpdate:
 *       type: object
 *       required: [estadoClienteId]
 *       properties:
 *         estadoClienteId:
 *           type: integer
 *           description: Identificador de T_Estado_Cliente (ej. 1=Habilitado, 2=Deshabilitado)
 *       example:
 *         estadoClienteId: 3
 */

module.exports = {};
