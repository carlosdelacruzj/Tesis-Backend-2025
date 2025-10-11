// src/modules/cotizacion/cotizacion.routes.rest.js
const { Router } = require("express");
const ctrl = require("./cotizacion.controller");

const router = Router();

/**
 * @swagger
 * /cotizaciones:
 *   get:
 *     tags: [cotizacion]
 *     summary: Listar cotizaciones
 *     parameters:
 *       - in: query
 *         name: estado
 *         required: false
 *         schema: { type: string, enum: [Borrador, Enviada, Aceptada, Rechazada] }
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CotizacionList'
 */
router.get("/", ctrl.getAll);

/**
 * @swagger
 * /cotizaciones/{id}:
 *   get:
 *     tags: [cotizacion]
 *     summary: Obtener cotización por ID (JSON crudo del SP)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CotizacionDetailSP'
 *       '404': { description: No encontrado }
 */
router.get("/:id(\\d+)", ctrl.getById);

/**
 * @swagger
 * /cotizaciones/public:
 *   post:
 *     tags: [cotizacion]
 *     summary: Crear cotización (público/prospecto)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CotizacionCreatePublic' }
 *     responses:
 *       '201': { description: Creado }
 */
router.post("/public", ctrl.createPublic);

/**
 * @swagger
 * /cotizaciones/admin:
 *   post:
 *     tags: [cotizacion]
 *     summary: Crear cotización (admin, con ítems)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CotizacionCreateAdmin' }
 *     responses:
 *       '201': { description: Creado }
 */
router.post("/admin", ctrl.createAdmin);

/**
 * @swagger
 * /cotizaciones/{id}:
 *   put:
 *     tags: [cotizacion]
 *     summary: Actualizar cotización (admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CotizacionUpdate' }
 *     responses:
 *       '200': { description: Actualizado }
 */
router.put("/:id(\\d+)", ctrl.update);

/**
 * @swagger
 * /cotizaciones/{id}:
 *   delete:
 *     tags: [cotizacion]
 *     summary: Eliminar cotización
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '200': { description: Eliminado }
 */
router.delete("/:id(\\d+)", ctrl.remove);

module.exports = router;
