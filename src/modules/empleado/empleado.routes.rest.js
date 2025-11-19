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
 * /empleados/lista:
 *   get:
 *     tags: [empleado]
 *     summary: Listado simple de empleados (select/options)
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Empleado' }
 */
router.get("/lista", ctrl.getList);

/**
 * @swagger
 * /empleados/disponibles/{idProyecto}:
 *   get:
 *     tags: [empleado]
 *     summary: Empleados disponibles por proyecto
 *     parameters:
 *       - in: path
 *         name: idProyecto
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Empleado' }
 */
router.get("/disponibles/:idProyecto", ctrl.getDisponibles);

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
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Empleado' }
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
