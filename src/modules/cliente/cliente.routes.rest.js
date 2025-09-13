const { Router } = require("express");
const ctrl = require("./cliente.controller");
const router = Router();

/**
 * @swagger
 * /clientes:
 *   get:
 *     tags: [cliente]
 *     summary: Listar clientes
 *     responses: { '200': { description: OK } }
 */
router.get("/", ctrl.getAllCliente);

/**
 * @swagger
 * /clientes/{id}:
 *   get:
 *     tags: [cliente]
 *     summary: Obtener cliente por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '200': { description: OK }
 *       '404': { description: No encontrado }
 */
router.get("/:id", ctrl.getByIdCliente);

/**
 * @swagger
 * /clientes/by-doc/{doc}:
 *   get:
 *     tags: [cliente]
 *     summary: Obtener cliente por documento
 *     parameters:
 *       - in: path
 *         name: doc
 *         required: true
 *         schema: { type: string }
 *     responses: { '200': { description: OK } }
 */
router.get("/by-doc/:doc", ctrl.getDataCliente);

/**
 * @swagger
 * /clientes:
 *   post:
 *     tags: [cliente]
 *     summary: Crear cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ClienteCreate' }
 *     responses: { '201': { description: Creado } }
 */
router.post("/", ctrl.postCliente);

/**
 * @swagger
 * /clientes/{id}:
 *   put:
 *     tags: [cliente]
 *     summary: Actualizar cliente (correo/celular/direccion)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ClienteUpdate' }
 *     responses: { '200': { description: Actualizado } }
 */
router.put("/:id", ctrl.putClienteById);

module.exports = router;
