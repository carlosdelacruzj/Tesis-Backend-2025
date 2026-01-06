const { Router } = require("express");
const multer = require("multer");
const ctrl = require("./pagos.controller");

// Config de Multer (ajusta a tu storage real)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: pagos
 *     description: Gestión de pagos y vouchers
 */

/**
 * @swagger
 * /pagos:
 *   get:
 *     tags: [pagos]
 *     summary: Listar todos los vouchers registrados
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Voucher'
 */
router.get("/", ctrl.getAllPagos);

/**
 * @swagger
 * /pagos/pendientes:
 *   get:
 *     tags: [pagos]
 *     summary: Listar pedidos con estado de pago Pendiente
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PedidoLite'
 */
router.get("/pendientes", ctrl.getPendientes);

/**
 * @swagger
 * /pagos/parciales:
 *   get:
 *     tags: [pagos]
 *     summary: Listar pedidos con estado de pago Parcial
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PedidoLite'
 */
router.get("/parciales", ctrl.getParciales);

/**
 * @swagger
 * /pagos/pagados:
 *   get:
 *     tags: [pagos]
 *     summary: Listar pedidos con estado de pago Pagado
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PedidoLite'
 */
router.get("/pagados", ctrl.getPagados);

/**
 * @swagger
 * /pagos/resumen/{pedidoId}:
 *   get:
 *     tags: [pagos]
 *     summary: Resumen de pago del pedido
 *     parameters:
 *       - in: path
 *         name: pedidoId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '200': { description: OK }
 */
router.get("/resumen/:pedidoId", ctrl.getResumen);

/**
 * @swagger
 * /pagos/vouchers/{pedidoId}:
 *   get:
 *     tags: [pagos]
 *     summary: Vouchers del pedido
 *     parameters:
 *       - in: path
 *         name: pedidoId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '200': { description: OK }
 */
router.get("/vouchers/:pedidoId", ctrl.getVouchers);

/**
 * @swagger
 * /pagos/metodos:
 *   get:
 *     tags: [pagos]
 *     summary: Listar métodos de pago
 *     responses:
 *       '200': { description: OK }
 */
router.get("/metodos", ctrl.getMetodos);

/**
 * @swagger
 * /pagos/estados:
 *   get:
 *     tags: [pagos]
 *     summary: Listar estados de pago
 *     responses:
 *       '200': { description: OK }
 */
router.get("/estados", ctrl.getEstadosPago);

/**
 * @swagger
 * /pagos:
 *   post:
 *     tags: [pagos]
 *     summary: Registrar voucher (multipart)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/PagoCreate'
 *     responses:
 *       '201': { description: Creado }
 *       '400': { description: Datos inválidos }
 */
router.post("/", upload.single("file"), ctrl.postPago);

/**
 * @swagger
 * /pagos/{id}:
 *   get:
 *     tags: [pagos]
 *     summary: Obtener un voucher por id
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
 *               $ref: '#/components/schemas/Voucher'
 *       '404': { description: No encontrado }
 */
router.get("/:id(\\d+)", ctrl.getPagoById);

/**
 * @swagger
 * /pagos/{id}/imagen:
 *   get:
 *     tags: [pagos]
 *     summary: Devuelve la imagen del voucher (BLOB)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Id del voucher
 *     responses:
 *       '200':
 *         description: Imagen del voucher
 *         content:
 *           image/png:    { schema: { type: string, format: binary } }
 *           image/jpeg:   { schema: { type: string, format: binary } }
 *           application/octet-stream: { schema: { type: string, format: binary } }
 *       '404': { description: No encontrado }
 */
router.get("/:id/imagen", ctrl.getVoucherImage);

/**
 * @swagger
 * /pagos/{id}:
 *   put:
 *     tags: [pagos]
 *     summary: Actualizar un voucher (monto, metodo, estado, fecha, imagen)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/PagoUpdate'
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Voucher'
 *       '400': { description: Datos inválidos }
 *       '404': { description: No encontrado }
 */
router.put("/:id(\\d+)", upload.single("file"), ctrl.putPago);

/**
 * @swagger
 * /pagos/{id}:
 *   delete:
 *     tags: [pagos]
 *     summary: Eliminar un voucher
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '204': { description: Eliminado }
 *       '404': { description: No encontrado }
 */
router.delete("/:id(\\d+)", ctrl.deletePago);

module.exports = router;
