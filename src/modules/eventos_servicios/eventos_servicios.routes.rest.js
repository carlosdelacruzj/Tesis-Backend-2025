const { Router } = require("express");
const ctrl = require("./eventos_servicios.controller");
const router = Router();

/**
 * @swagger
 * /eventos_servicios:
 *   get:
 *     tags: [eventos - servicios]
 *     summary: Lista la relación evento-servicio (con filtros opcionales)
 *     parameters:
 *       - in: query
 *         name: evento
 *         required: false
 *         schema: { type: integer }
 *         description: ID del evento
 *       - in: query
 *         name: servicio
 *         required: false
 *         schema: { type: integer }
 *         description: ID del servicio
 *     responses: { '200': { description: OK } }
 */
router.get("/", ctrl.getAll);

/**
 * @swagger
 * /eventos_servicios/{id}:
 *   get:
 *     tags: [eventos - servicios]
 *     summary: Obtener un evento-servicio por ID
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
 * /eventos_servicios:
 *   post:
 *     tags: [eventos - servicios]
 *     summary: Crear relación evento-servicio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/EventoServicioCreate' }
 *     responses: { '201': { description: Creado } }
 */
router.post("/", ctrl.create);

/**
 * @swagger
 * /eventos_servicios/{id}:
 *   put:
 *     tags: [eventos - servicios]
 *     summary: Actualizar relación evento-servicio
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/EventoServicioUpdate' }
 *     responses: { '200': { description: Actualizado } }
 */
router.put("/:id", ctrl.update);

module.exports = router;
