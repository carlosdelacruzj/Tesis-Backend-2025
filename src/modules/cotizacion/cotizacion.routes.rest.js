// modules/cotizacion/cotizacion.routes.rest.js
const { Router } = require("express");
const ctrl = require("./cotizacion.controller");

const router = Router();

/**
 * Este router NO agrega prefijos.
 * En routes/index.js se monta como:
 *   router.use("/cotizaciones", require("../modules/cotizacion/cotizacion.routes.rest"));
 *
 * Con /api/v1 delante, quedan:
 *   GET    /api/v1/cotizaciones
 *   GET    /api/v1/cotizaciones/:id
 *   GET    /api/v1/cotizaciones/:id/pdf
 *   POST   /api/v1/cotizaciones/:id/pdf
 *   POST   /api/v1/cotizaciones/public
 *   POST   /api/v1/cotizaciones/admin
 *   PUT    /api/v1/cotizaciones/:id
 *   DELETE /api/v1/cotizaciones/:id
 *   PUT    /api/v1/cotizaciones/:id/estado
 */

/**
 * @swagger
 * tags:
 *   - name: cotizacion
 *     description: Gestión de cotizaciones (listado, detalle, creación, PDF, actualización, estado)
 */

/**
 * @swagger
 * /cotizaciones:
 *   get:
 *     tags: [cotizacion]
 *     summary: Listar cotizaciones
 *     description: Devuelve el listado plano de cotizaciones; opcionalmente filtra por estado.
 *     parameters:
 *       - in: query
 *         name: estado
 *         required: false
 *         schema:
 *           type: string
 *           enum: [Borrador, Enviada, Aceptada, Rechazada]
 *         description: Estado por el que se desea filtrar.
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
 *     summary: Obtener cotización (detalle con ítems)
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
 *     summary: Descargar PDF de la cotización (stream)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: mode
 *         required: false
 *         schema:
 *           type: string
 *           enum: [diag]
 *         description: Si se envía `diag`, devuelve un PDF diagnóstico minimal.
 *       - in: query
 *         name: raw
 *         required: false
 *         schema:
 *           type: string
 *         description: Si `raw=1`, retorna JSON con los ítems normalizados en lugar de PDF.
 *     responses:
 *       '200':
 *         description: PDF generado
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       '404': { description: No encontrado }
 */
router.get("/:id(\\d+)/pdf", ctrl.downloadPdf);

/**
 * @swagger
 * /cotizaciones/{id}/pdf:
 *   post:
 *     tags: [cotizacion]
 *     summary: Generar PDF con sobreescrituras (logo, firma, equipo) desde el body
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: mode
 *         required: false
 *         schema:
 *           type: string
 *           enum: [diag]
 *       - in: query
 *         name: raw
 *         required: false
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company:
 *                 type: object
 *                 properties:
 *                   logoBase64:  { type: string, description: "data:image/*;base64,..." }
 *                   firmaBase64: { type: string, description: "data:image/*;base64,..." }
 *               videoEquipo:
 *                 type: string
 *                 description: Texto o resumen del equipo de video a mostrar.
 *     responses:
 *       '200':
 *         description: PDF generado
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       '404': { description: No encontrado }
 */
router.post("/:id(\\d+)/pdf", ctrl.downloadPdf);

/**
 * @swagger
 * /cotizaciones/public:
 *   post:
 *     tags: [cotizacion]
 *     summary: Crear cotización (flujo público/web)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CotizacionCreatePublic' }
 *     responses:
 *       '201':
 *         description: Creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lead_id:       { type: integer, example: 10 }
 *                 cotizacion_id: { type: integer, example: 25 }
 *       '400': { description: Parámetros inválidos }
 */
router.post("/public", ctrl.createPublic);

/**
 * @swagger
 * /cotizaciones/admin:
 *   post:
 *     tags: [cotizacion]
 *     summary: Crear cotización (flujo admin/backoffice)
 *     description: |
 *       Prioriza **cliente**: si `cliente.id > 0`, no se crea lead.
 *       Si no se envía `cliente.id`, se crea un **lead** con los datos proporcionados.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CotizacionCreateAdmin' }
 *     responses:
 *       '201':
 *         description: Creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [idCotizacion, origen]
 *               properties:
 *                 idCotizacion: { type: integer, example: 42 }
 *                 clienteId:    { type: integer, nullable: true, example: 101 }
 *                 leadId:       { type: integer, nullable: true, example: 55 }
 *                 origen:
 *                   type: string
 *                   enum: [CLIENTE, LEAD]
 *                   example: CLIENTE
 *       '400': { description: Parámetros inválidos }
 */
router.post("/admin", ctrl.createAdmin);


/**
 * @swagger
 * /cotizaciones/{id}:
 *   put:
 *     tags: [cotizacion]
 *     summary: Actualizar cotización (cabecera y/o ítems)
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
 *       '200':
 *         description: Actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 updated: { type: boolean, example: true }
 *       '400': { description: Parámetros inválidos }
 *       '404': { description: No encontrado }
 */
router.put("/:id(\\d+)", ctrl.update);

/**
 * @swagger
 * /cotizaciones/{id}:
 *   delete:
 *     tags: [cotizacion]
 *     summary: Eliminar cotización (si es la única del lead, elimina el lead también)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '200':
 *         description: Eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deleted:     { type: boolean, example: true }
 *                 leadDeleted: { type: boolean, example: false }
 *       '404': { description: No encontrado }
 */
router.delete("/:id(\\d+)", ctrl.remove);

/**
 * @swagger
 * /cotizaciones/{id}/estado:
 *   put:
 *     tags: [cotizacion]
 *     summary: Cambiar estado con concurrencia optimista
 *     description: |
 *       Cambia el estado de la cotización validando que el estado leído por el cliente
 *       (estadoEsperado) siga vigente. Si no coincide, responde con conflicto.
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
 *       '400': { description: Parámetros inválidos }
 *       '404': { description: No encontrado }
 *       '409': { description: Conflicto por concurrencia (estado cambió) }
 */
router.put("/:id(\\d+)/estado", ctrl.updateEstado);

module.exports = router;
