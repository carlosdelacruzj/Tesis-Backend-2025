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
 *         proyectosAfectados:
 *           type: array
 *           description: Solo se incluye al cambiar a estado inhabilitante (mantenimiento/baja)
 *           items:
 *             $ref: '#/components/schemas/EquipoProyectoAfectado'
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
 *         proyectosAfectados: []
 *
 *     EquipoProyectoAfectado:
 *       type: object
 *       properties:
 *         proyectoId: { type: integer }
 *         nombreProyecto: { type: string, nullable: true }
 *         fechaInicio: { type: string, format: date }
 *         fechaFin: { type: string, format: date }
 *         empleadoId: { type: integer, nullable: true }
 *         empleadoNombre: { type: string, nullable: true }
 *         nota: { type: string, nullable: true }
 *       required: [proyectoId, fechaInicio, fechaFin]
 *       example:
 *         proyectoId: 101
 *         nombreProyecto: "Cobertura Evento"
 *         fechaEventoInicio: "2024-07-20"
 *         fechaInicio: "2024-07-20"
 *         fechaFin: "2024-07-21"
 *         empleadoId: 7
 *         empleadoNombre: "Ana Pérez"
 *         nota: "Asignación cancelada por mantenimiento"
 *
 *     EquipoResumen:
 *       type: object
 *       properties:
 *         idTipoEquipo: { type: integer }
 *         nombreTipoEquipo: { type: string }
 *         idMarca: { type: integer }
 *         nombreMarca: { type: string }
 *         idModelo: { type: integer }
 *         nombreModelo: { type: string }
 *         cantidad: { type: integer, description: "Total sin incluir equipos dados de baja" }
 *         disponibles: { type: integer, description: "Cantidad en estado Disponible" }
 *       required: [idTipoEquipo, idMarca, idModelo, cantidad, disponibles]
 *       example:
 *         idTipoEquipo: 1
 *         nombreTipoEquipo: "Cámara"
 *         idMarca: 3
 *         nombreMarca: "Canon"
 *         idModelo: 5
 *         nombreModelo: "EOS R5"
 *         cantidad: 10
 *         disponibles: 7
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
