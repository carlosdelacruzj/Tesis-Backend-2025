/**
 * @swagger
 * components:
 *   schemas:
 *     Proyecto:
 *       type: object
 *       properties:
 *         id:              { type: integer }
 *         proyecto_nombre: { type: string }
 *         codigo_pedido:   { type: integer }
 *         fecha_inicio:    { type: string, format: date }
 *
 *     ProyectoCreate:
 *       type: object
 *       required: [proyecto_nombre, codigo_pedido, fecha_inicio_edicion]
 *       properties:
 *         proyecto_nombre: { type: string }
 *         codigo_pedido:   { type: integer }
 *         fecha_inicio_edicion:
 *           type: string
 *           format: date
 *           description: YYYY-MM-DD
 *       example:
 *         proyecto_nombre: "Evento corporativo"
 *         codigo_pedido: 2
 *         fecha_inicio_edicion: "2025-09-09"
 *
 *     ProyectoUpdate:
 *       type: object
 *       properties:
 *         finFecha:
 *           type: string
 *           format: date
 *           description: YYYY-MM-DD
 *         multimedia: { type: integer }
 *         edicion:    { type: integer }
 *         enlace:     { type: string }
 *         id:         { type: integer }
 *       required: [id]
 *       example:
 *         id: 1
 *         finFecha: "2025-10-01"
 *         multimedia: 1
 *         edicion: 1
 *         enlace: "https://link.com/drive"
 *
 *     AsignarCreate:
 *       type: object
 *       required: [proyecto, empleado, equipos]
 *       properties:
 *         proyecto: { type: integer }
 *         empleado: { type: integer }
 *         equipos:
 *           type: string
 *           description: Código equipo (ej. CAM-0002)
 *       example:
 *         proyecto: 1
 *         empleado: 3
 *         equipos: "CAM-0002"
 *
 *     AsignarUpdate:
 *       type: object
 *       required: [id, empleado, equipo]
 *       properties:
 *         id:       { type: integer }
 *         empleado:{ type: integer }
 *         equipo:  { type: string }
 *       example:
 *         id: 5
 *         empleado: 4
 *         equipo: "CAM-0003"
 */

module.exports = {};
