/**
 * @swagger
 * components:
 *   schemas:
 *     Proyecto:
 *       type: object
 *       properties:
 *         proyectoId:          { type: integer }
 *         proyectoNombre:      { type: string }
 *         pedidoId:            { type: integer }
 *         fechaInicioEdicion:  { type: string, format: date }
 *         fechaFinEdicion:     { type: string, format: date, nullable: true }
 *         estadoId:            { type: integer }
 *         estadoNombre:        { type: string, nullable: true }
 *         estadoPedidoId:      { type: integer, nullable: true }
 *         estadoPedidoNombre:  { type: string, nullable: true }
 *         estadoPagoId:        { type: integer, nullable: true }
 *         estadoPagoNombre:    { type: string, nullable: true }
 *         montoAbonado:        { type: number, format: double, nullable: true }
 *         saldoPendiente:      { type: number, format: double, nullable: true }
 *         pedidoServicios:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               pedidoServicioId: { type: integer }
 *               eventoServicioId: { type: integer, nullable: true }
 *               nombre:           { type: string, nullable: true }
 *               cantidad:         { type: number, format: double, nullable: true }
 *               precioUnit:       { type: number, format: double, nullable: true }
 *               subtotal:         { type: number, format: double, nullable: true }
 *               descripcion:      { type: string, nullable: true }
 *         personalRequerido:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               eventoServicioId: { type: integer, nullable: true }
 *               rol:              { type: string, nullable: true }
 *               cantidad:         { type: integer, nullable: true }
 *         equiposRequeridos:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               eventoServicioId:  { type: integer, nullable: true }
 *               tipoEquipoId:      { type: integer, nullable: true }
 *               tipoEquipoNombre:  { type: string, nullable: true }
 *               cantidad:          { type: integer, nullable: true }
 *               notas:             { type: string, nullable: true }
 *         responsableId:       { type: integer, nullable: true }
 *         notas:               { type: string, nullable: true }
 *         enlace:              { type: string, nullable: true }
 *
 *     EstadoProyecto:
 *       type: object
 *       properties:
 *         estadoId:     { type: integer }
 *         estadoNombre: { type: string }
 *         orden:        { type: integer }
 *         activo:       { type: integer, enum: [0,1] }
 *       example:
 *         estadoId: 2
 *         estadoNombre: "En ejecucion"
 *         orden: 2
 *         activo: 1
 *
 *     ProyectoCreate:
 *       type: object
 *       required: [proyectoNombre, pedidoId, fechaInicioEdicion]
 *       properties:
 *         proyectoNombre:     { type: string }
 *         pedidoId:           { type: integer }
 *         fechaInicioEdicion:
 *           type: string
 *           format: date
 *           description: YYYY-MM-DD
 *         fechaFinEdicion:
 *           type: string
 *           format: date
 *           nullable: true
 *           description: YYYY-MM-DD (opcional)
 *         estadoId:
 *           type: integer
 *           description: FK a T_Estado_Proyecto (por defecto Planificado)
 *         responsableId:
 *           type: integer
 *           nullable: true
 *           description: FK a T_Empleados
 *         notas:
 *           type: string
 *           nullable: true
 *         enlace:
 *           type: string
 *           nullable: true
 *       example:
 *         proyectoNombre: "Evento corporativo"
 *         pedidoId: 2
 *         fechaInicioEdicion: "2025-09-09"
 *         fechaFinEdicion: "2025-09-10"
 *         estadoId: 1
 *         responsableId: 3
 *         notas: "Reunirse 30 min antes"
 *         enlace: "https://drive.com/entrega"
 *
 *     ProyectoUpdate:
 *       type: object
 *       properties:
 *         proyectoNombre:       { type: string }
 *         fechaInicioEdicion:   { type: string, format: date }
 *         fechaFinEdicion:      { type: string, format: date }
 *         estadoId:             { type: integer }
 *         responsableId:        { type: integer }
 *         notas:                { type: string }
 *         enlace:               { type: string }
 *         multimedia:           { type: integer }
 *         edicion:              { type: integer }
 *       required: []
 *       example:
 *         proyectoNombre: "Evento corporativo"
 *         fechaInicioEdicion: "2025-09-09"
 *         fechaFinEdicion: "2025-10-01"
 *         estadoId: 2
 *         responsableId: 4
 *         notas: "Cambiar locación a parque"
 *         enlace: "https://link.com/drive"
 *         multimedia: 1
 *         edicion: 1
 */

module.exports = {};
