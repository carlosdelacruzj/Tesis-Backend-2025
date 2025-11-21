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
