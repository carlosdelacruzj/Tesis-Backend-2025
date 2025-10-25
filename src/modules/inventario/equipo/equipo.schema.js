/**
 * @swagger
 * components:
 *   schemas:
 *     Equipo:
 *       type: object
 *       properties:
 *         idEquipo: { type: integer }
 *         fechaIngreso: { type: string, format: date }
 *         idModelo: { type: integer }
 *         nombreModelo: { type: string }
 *         idMarca: { type: integer }
 *         nombreMarca: { type: string }
 *         idTipoEquipo: { type: integer }
 *         nombreTipoEquipo: { type: string }
 *         idEstado: { type: integer }
 *         nombreEstado: { type: string }
 *         serie: { type: string, maxLength: 64 }
 *       required: [idEquipo, idModelo, idEstado]
 *       example:
 *         idEquipo: 101
 *         fechaIngreso: "2025-10-23"
 *         idModelo: 5
 *         nombreModelo: "EOS R5"
 *         idMarca: 3
 *         nombreMarca: "Canon"
 *         idTipoEquipo: 1
 *         nombreTipoEquipo: "Cámara"
 *         idEstado: 2
 *         nombreEstado: "En uso"
 *         serie: "SN-1234567890"
 *
 *     EquipoCreate:
 *       type: object
 *       required: [idModelo, idEstado]
 *       properties:
 *         fechaIngreso: { type: string, format: date, nullable: true }
 *         idModelo: { type: integer }
 *         idEstado: { type: integer }
 *         serie: { type: string, maxLength: 64, nullable: true }
 *       example:
 *         fechaIngreso: "2025-10-20"
 *         idModelo: 5
 *         idEstado: 1
 *         serie: "SN-123456"
 *
 *     EquipoUpdate:
 *       type: object
 *       required: [idModelo, idEstado]
 *       properties:
 *         fechaIngreso: { type: string, format: date, nullable: true }
 *         idModelo: { type: integer }
 *         idEstado: { type: integer }
 *         serie: { type: string, maxLength: 64, nullable: true }
 *       example:
 *         fechaIngreso: "2025-11-01"
 *         idModelo: 6
 *         idEstado: 3
 *         serie: "SN-654321"
 *
 *     EquipoEstado:
 *       type: object
 *       properties:
 *         idEstado: { type: integer }
 *         nombreEstado: { type: string }
 *       required: [idEstado, nombreEstado]
 *       example:
 *         idEstado: 1
 *         nombreEstado: "Disponible"
 *
 *     EquipoEstadoUpdate:
 *       type: object
 *       required: [idEstado]
 *       properties:
 *         idEstado: { type: integer }
 *       example:
 *         idEstado: 2
 */

module.exports = {};
