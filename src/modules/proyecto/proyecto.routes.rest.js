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
router.get("/:id", ctrl.getByIdProyecto);

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
 * /proyecto:
 *   put:
 *     tags: [proyecto]
 *     summary: Actualizar proyecto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProyectoUpdate' }
 *     responses: { '200': { description: Actualizado } }
 */
router.put("/", ctrl.putProyecto);

/**
 * @swagger
 * /proyecto/pedidos-contratado:
 *   get:
 *     tags: [proyecto]
 *     summary: Listar pedidos contratados
 *     responses: { '200': { description: OK } }
 */
router.get("/pedidos-contratado", ctrl.getAllPedidosContratado);

/**
 * @swagger
 * /proyecto/asignaciones:
 *   get:
 *     tags: [proyecto]
 *     summary: Listar asignaciones de equipos (todas)
 *     responses: { '200': { description: OK } }
 */
router.get("/asignaciones", ctrl.getAsignaciones); // SIN id

/**
 * @swagger
 * /proyecto/{id}/equipos:
 *   get:
 *     tags: [proyecto]
 *     summary: Listar asignaciones de equipos por proyecto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses: { '200': { description: OK } }
 */
router.get("/:id/equipos", ctrl.getAsignacionesByProyecto);

/**
 * @swagger
 * /proyecto/asignaciones:
 *   post:
 *     tags: [proyecto]
 *     summary: Registrar asignación de equipo a proyecto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/AsignarCreate' }
 *     responses: { '201': { description: Creado } }
 */
router.post("/asignaciones", ctrl.postAsignacion);

/**
 * @swagger
 * /proyecto/asignaciones:
 *   put:
 *     tags: [proyecto]
 *     summary: Actualizar asignación de equipo por ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/AsignarUpdate' }
 *     responses: { '200': { description: Actualizado } }
 */
router.put("/asignaciones", ctrl.putAsignacion);

/**
 * @swagger
 * /proyecto/asignaciones/{id}:
 *   delete:
 *     tags: [proyecto]
 *     summary: Eliminar asignación por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses: { '200': { description: Eliminado } }
 */
router.delete("/asignaciones/:id", ctrl.deleteAsignacion);

/**
 * @swagger
 * /proyecto/equipos:
 *   get:
 *     tags: [proyecto]
 *     summary: Listar equipos filtrados
 *     parameters:
 *       - in: query
 *         name: fecha
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: proyecto
 *         schema: { type: integer }
 *       - in: query
 *         name: idTipoEquipo
 *         schema: { type: integer }
 *     responses: { '200': { description: OK } }
 */
router.get("/equipos", ctrl.getEquiposFiltrados);

/**
 * @swagger
 * /proyecto/{id}/eventos:
 *   get:
 *     tags: [proyecto]
 *     summary: Listar eventos de un proyecto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses: { '200': { description: OK } }
 */
router.get("/:id/eventos", ctrl.getEventosByProyecto);

module.exports = router;
