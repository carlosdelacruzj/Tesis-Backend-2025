// src/modules/empleado/empleado.routes.rest.js
const { Router } = require("express");
const ctrl = require("./empleado.controller");
const router = Router();

/**
 * @swagger
 * /empleados:
 *   get:
 *     tags: [empleado]
 *     summary: Listar empleados
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Empleado' }
 */
router.get("/", ctrl.getAll);

/**
 * @swagger
 * /empleados/operativos:
 *   get:
 *     tags: [empleado]
 *     summary: Empleados operativos de campo y activos (minimal)
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   empleadoId: { type: integer }
 *                   usuarioId: { type: integer }
 *                   nombre: { type: string }
 *                   apellido: { type: string }
 *                   cargoId: { type: integer }
 *                   cargo: { type: string }
 *                   estadoId: { type: integer }
 *                   estado: { type: string }
 *                   operativoCampo: { type: boolean }
 */
router.get("/operativos", ctrl.getOperativos);

/**
 * @swagger
 * /empleados/cargos:
 *   get:
 *     tags: [empleado]
 *     summary: Listar cargos
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Cargo' }
 */
router.get("/cargos", ctrl.getCargos);

/**
 * @swagger
 * /empleados/{id}:
 *   get:
 *     tags: [empleado]
 *     summary: Obtener empleado por ID
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
 *             schema: { $ref: '#/components/schemas/Empleado' }
 *       '404': { description: No encontrado }
 */
router.get("/:id", ctrl.getById);

/**
 * @swagger
 * /empleados:
 *   post:
 *     tags: [empleado]
 *     summary: Crear empleado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/EmpleadoCreate' }
 *     responses:
 *       '201':
 *         description: Creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Status:
 *                   type: string
 *                   example: Registro exitoso
 */
router.post("/", ctrl.create);

/**
 * @swagger
 * /empleados/{id}:
 *   put:
 *     tags: [empleado]
 *     summary: Actualizar empleado (correo/celular/direccion/estado)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/EmpleadoUpdate' }
 *     responses:
 *       '200':
 *         description: Actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Status:
 *                   type: string
 *                   example: Actualizacion exitosa
 */
router.put("/:id", ctrl.update);

module.exports = router;
