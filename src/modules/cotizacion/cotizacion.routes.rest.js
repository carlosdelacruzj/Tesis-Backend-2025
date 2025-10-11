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
 * /cotizaciones/{id}/pdf:
 *   get:
 *     tags: [cotizacion]
 *     summary: Descargar cotización en PDF
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '200':
 *         description: PDF generado
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       '401': { description: Unauthorized }
 *       '404': { description: No encontrado }
 */
router.get("/:id(\\d+)/pdf", ctrl.downloadPdf);

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
/**
 * @swagger
 * /cotizaciones/{id}/estado:
 *   put:
 *     tags: [cotizacion]
 *     summary: Cambiar estado con concurrencia optimista
 *     description: |
 *       Cambia el estado de la cotización aplicando reglas de transición y validación de versión (estadoEsperado).
 *       Si otro usuario cambió el estado entre tu lectura y esta operación, responderá con conflicto (409).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CotizacionEstadoUpdateOptimista' }
 *     responses:
 *       '200':
 *         description: Estado actualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CotizacionEstadoUpdateResponse' }
 *       '409':
 *         description: Conflicto de versión
 */
router.put("/:id(\\d+)/estado", ctrl.updateEstado);

module.exports = router;
