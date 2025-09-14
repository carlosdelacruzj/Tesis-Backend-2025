const { Router } = require("express");
const ctrl = require("./servicio.controller");
const router = Router();

/**
 * @swagger
 * /servicios:
 *   get:
 *     tags: [servicio]
 *     summary: Listar servicios
 *     responses: { '200': { description: OK } }
 */
router.get("/", ctrl.getAll);

/**
 * @swagger
 * /servicios/{id}:
 *   get:
 *     tags: [servicio]
 *     summary: Obtener servicio por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '200': { description: OK }
 *       '404': { description: No encontrado }
 */
router.get("/:id", ctrl.getById);

/**
 * @swagger
 * /servicios:
 *   post:
 *     tags: [servicio]
 *     summary: Crear servicio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ServicioCreate' }
 *     responses: { '201': { description: Creado } }
 */
router.post("/", ctrl.create);

/**
 * @swagger
 * /servicios/{id}:
 *   put:
 *     tags: [servicio]
 *     summary: Actualizar servicio (solo nombre)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ServicioUpdate' }
 *     responses: { '200': { description: Actualizado } }
 */
router.put("/:id", ctrl.update);

module.exports = router;
