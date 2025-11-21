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
 *         fecha_inicio_edicion: { type: string, format: date }
 *         fecha_fin_edicion:    { type: string, format: date, nullable: true }
 *         pro_estado:      { type: integer, description: FK a T_Estado_Proyecto }
 *         responsableId:   { type: integer, nullable: true }
 *         notas:           { type: string, nullable: true }
 *         enlace:          { type: string, nullable: true }
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
 *         fecha_fin_edicion:
 *           type: string
 *           format: date
 *           nullable: true
 *           description: YYYY-MM-DD (opcional)
 *         pro_estado:
 *           type: integer
 *           description: FK a T_Estado_Proyecto (default 1 = Planificado)
 *           default: 1
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
 *         proyecto_nombre: "Evento corporativo"
 *         codigo_pedido: 2
 *         fecha_inicio_edicion: "2025-09-09"
 *         fecha_fin_edicion: "2025-09-10"
 *         pro_estado: 1
 *         responsableId: 3
 *         notas: "Reunirse 30 min antes"
 *         enlace: "https://drive.com/entrega"
 *
 *     ProyectoUpdate:
 *       type: object
 *       properties:
 *         id:                   { type: integer }
 *         proyecto_nombre:      { type: string }
 *         fecha_inicio_edicion: { type: string, format: date }
 *         fecha_fin_edicion:    { type: string, format: date }
 *         pro_estado:           { type: integer }
 *         responsableId:        { type: integer }
 *         notas:                { type: string }
 *         enlace:               { type: string }
 *         multimedia:           { type: integer }
 *         edicion:              { type: integer }
 *       required: [id]
 *       example:
 *         id: 1
 *         proyecto_nombre: "Evento corporativo"
 *         fecha_inicio_edicion: "2025-09-09"
 *         fecha_fin_edicion: "2025-10-01"
 *         pro_estado: 2
 *         responsableId: 4
 *         notas: "Cambiar locación a parque"
 *         enlace: "https://link.com/drive"
 *         multimedia: 1
 *         edicion: 1
 */

module.exports = {};
