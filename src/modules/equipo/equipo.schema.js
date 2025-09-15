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
 *     Equipo:
 *       type: object
 *       properties:
 *         idEquipo:
 *           type: string
 *           description: "Código del equipo (ej. CAM-0001)"
 *         fecha:
 *           type: string
 *           format: date
 *           description: "Fecha de ingreso o registro"
 *         modelo:
 *           type: integer
 *           description: "ID del modelo (FK a T_Modelo)"
 *         tipoEquipo:
 *           type: integer
 *           description: "ID del tipo de equipo (FK a T_Tipo_Equipo)"
 *         marca:
 *           type: integer
 *           description: "ID de la marca (FK a T_Marca)"
 *         estado:
 *           type: string
 *           description: "Nombre del estado actual (p. ej. Disponible)"
 *       required: [idEquipo, modelo]
 *       example:
 *         idEquipo: "CAM-0003"
 *         fecha: "2025-09-08"
 *         modelo: 1
 *         tipoEquipo: 2
 *         marca: 3
 *         estado: "Disponible"
 *
 *     EquipoCreate:
 *       type: object
 *       required: [idEquipo, fecha, modelo]
 *       properties:
 *         idEquipo: { type: string }
 *         fecha:    { type: string, format: date }
 *         modelo:   { type: integer }
 *       example:
 *         idEquipo: "CAM-0005"
 *         fecha: "2025-09-14"
 *         modelo: 2
 *
 *     EquipoUpdateEstado:
 *       type: object
 *       required: [estado]
 *       properties:
 *         estado:
 *           type: integer
 *           enum: [1, 2, 3]
 *           description: "Nuevo estado (1=Disponible, 2=En uso, 3=Mantenimiento)"
 *       example:
 *         estado: 2
 */

module.exports = {};
