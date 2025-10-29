const { Router } = require("express");
const ctrl = require("../modules/auth/auth.controller");

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: auth
 *     description: Autenticacion
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [auth]
 *     summary: Login de cliente
 *     description: Valida correo y contrasena y devuelve un JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [correo, contrasena]
 *             properties:
 *               correo: { type: string, format: email, example: "carlos@example.com" }
 *               contrasena: { type: string, format: password, example: "cardel123" }
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string }
 *                 usuario:
 *                   type: object
 *                   properties:
 *                     id: { type: integer }
 *                     clienteId: { type: integer, nullable: true }
 *                     correo: { type: string }
 *                     nombres: { type: string, nullable: true }
 *                     apellidos: { type: string, nullable: true }
 *       '400': { description: Request inválido }
 *       '401': { description: Credenciales inválidas }
 */
router.post("/login", ctrl.login);

/**
 * @swagger
 * /auth/password:
 *   post:
 *     tags: [auth]
 *     summary: Establecer o actualizar contraseña
 *     description: Genera y almacena el hash de una nueva contraseña para el usuario indicado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [correo, contrasena]
 *             properties:
 *               correo: { type: string, format: email, example: "carlos@example.com" }
 *               contrasena: { type: string, format: password, example: "NuevaPassword123" }
 *     responses:
 *       '200': { description: Contraseña actualizada }
 *       '400': { description: Datos inválidos }
 *       '404': { description: Usuario no encontrado }
 */
router.post("/password", ctrl.setPassword);

module.exports = router;
