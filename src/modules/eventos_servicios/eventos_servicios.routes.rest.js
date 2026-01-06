const { Router } = require("express");
const ctrl = require("./eventos_servicios.controller");
const router = Router();

/**
 * @swagger
 * /eventos_servicios:
 *   get:
 *     tags: [eventos - servicios]
 *     summary: Lista la relaciÃ³n evento-servicio (con filtros opcionales)
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
 * /eventos_servicios/categorias:
 *   get:
 *     tags: [eventos - servicios]
 *     summary: Lista las categorias disponibles para evento-servicio (solo activas)
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/EventoServicioCategoria' }
 */
router.get("/categorias", ctrl.getCategorias);

/**
 * @swagger
 * /eventos_servicios/estados:
 *   get:
 *     tags: [eventos - servicios]
 *     summary: Lista los estados disponibles para evento-servicio (paquete)
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/EventoServicioEstado' }
 */
router.get("/estados", ctrl.getEstados);

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
 *     summary: Crear relaciÃ³n evento-servicio
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
 *     summary: Actualizar relaciÃ³n evento-servicio
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

/**
 * @swagger
 * /eventos_servicios/{id}/estado:
 *   patch:
 *     tags: [eventos - servicios]
 *     summary: Cambiar estado de un evento-servicio (activar/desactivar)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventoServicioEstadoUpdate'
 *     responses:
 *       "200": { description: OK }
 *       "404": { description: No encontrado }
 */
router.patch("/:id/estado", ctrl.patchEstado);

module.exports = router;

