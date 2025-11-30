// src/modules/proyecto/proyecto.routes.rest.js
const { Router } = require("express");
const ctrl = require("./proyecto.controller");
const router = Router();

/**
 * @swagger
 * /proyecto:
 *   get:
 *     tags: [proyecto]
 *     summary: Listar proyectos
 *     responses: { '200': { description: OK } }
 */
router.get("/", ctrl.getAllProyecto);

/**
 * @swagger
 * /proyecto:
 *   post:
 *     tags: [proyecto]
 *     summary: Crear proyecto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProyectoCreate' }
 *     responses: { '201': { description: Creado } }
 */
router.post("/", ctrl.postProyecto);

/**
 * @swagger
 * /proyecto/disponibilidad:
 *   get:
 *     tags: [proyecto]
 *     summary: Disponibilidad de equipos y empleados para un rango de fechas
 *     parameters:
 *       - in: query
 *         name: fechaInicio
 *         required: true
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: fechaFin
 *         required: true
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: proyectoId
 *         required: false
 *         schema: { type: integer }
 *         description: Se excluyen las asignaciones de este proyecto (útil al editar)
 *       - in: query
 *         name: tipoEquipoId
 *         required: false
 *         schema: { type: integer }
 *       - in: query
 *         name: cargoId
 *         required: false
 *         schema: { type: integer }
 *     responses: { '200': { description: OK } }
 */
router.get("/disponibilidad", ctrl.getDisponibilidad);

/**
 * @swagger
 * /proyecto/recursos:
 *   post:
 *     tags: [proyecto]
 *     summary: Asignar equipo (con o sin empleado) a un proyecto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [proyectoId, asignaciones]
 *             properties:
 *               proyectoId: { type: integer }
 *               asignaciones:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [equipoId, fechaInicio, fechaFin]
 *                   properties:
 *                     empleadoId:  { type: integer, nullable: true }
 *                     equipoId:    { type: integer }
 *                     fechaInicio: { type: string, format: date }
 *                     fechaFin:    { type: string, format: date }
 *                     notas:       { type: string, maxLength: 255 }
 *             example:
 *               proyectoId: 42
 *               asignaciones:
 *                 - empleadoId: 7
 *                   equipoId: 101
 *                   fechaInicio: "2024-07-18"
 *                   fechaFin: "2024-07-18"
 *                   notas: "Turno completo"
 *                 - empleadoId: 8
 *                   equipoId: 102
 *                   fechaInicio: "2024-07-18"
 *                   fechaFin: "2024-07-18"
 *                   notas: "Solo mañana"
 *                 - empleadoId: null
 *                   equipoId: 103
 *                   fechaInicio: "2024-07-18"
 *                   fechaFin: "2024-07-18"
 *                   notas: "Repuesto"
 *     responses: { '201': { description: Recurso agregado } }
 */
router.post("/recursos", ctrl.postRecurso);

/**
 * @swagger
 * /proyecto/{id}/asignaciones:
 *   get:
 *     tags: [proyecto]
 *     summary: Listar asignaciones (equipo/empleado/fechas) de un proyecto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses: { '200': { description: OK } }
 */
router.get("/:id(\\d+)/asignaciones", ctrl.getAsignaciones);

/**
 * @swagger
 * /proyecto/estados:
 *   get:
 *     tags: [proyecto]
 *     summary: Listar estados de proyecto
 *     responses: { '200': { description: OK } }
 */
router.get("/estados", ctrl.getEstados);

/**
 * @swagger
 * /proyecto/{id}:
 *   put:
 *     tags: [proyecto]
 *     summary: Actualizar proyecto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProyectoUpdate' }
 *     responses: { '200': { description: Actualizado } }
 */
router.put("/:id(\\d+)", ctrl.putProyecto);

/**
 * @swagger
 * /proyecto/{id}:
 *   delete:
 *     tags: [proyecto]
 *     summary: Eliminar proyecto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses: { '200': { description: Eliminado } }
 */
router.delete("/:id(\\d+)", ctrl.deleteProyecto);

/**
 * @swagger
 * /proyecto/{id}:
 *   get:
 *     tags: [proyecto]
 *     summary: Obtener proyecto por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '200': { description: OK }
 *       '404': { description: No encontrado }
 */
router.get("/:id(\\d+)", ctrl.getByIdProyecto);

module.exports = router;
