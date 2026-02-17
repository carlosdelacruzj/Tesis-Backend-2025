const { Router } = require("express");
const ctrl = require("./acceso.controller");
const requireProfile = require("../../middlewares/require-profile");

const router = Router();

// Solo administradores
router.use(requireProfile("ADMIN"));

/**
 * @swagger
 * /acceso/perfiles:
 *   get:
 *     tags: [acceso]
 *     summary: Listar perfiles de acceso
 *     responses:
 *       "200":
 *         description: OK
 */
router.get("/perfiles", ctrl.getPerfiles);

/**
 * @swagger
 * /acceso/perfiles:
 *   post:
 *     tags: [acceso]
 *     summary: Crear perfil de acceso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [codigo, nombre]
 *             properties:
 *               codigo: { type: string, example: "SUPERVISOR" }
 *               nombre: { type: string, example: "Supervisor" }
 *               descripcion: { type: string, example: "Perfil de supervision" }
 *               activo: { type: boolean, example: true }
 *     responses:
 *       "201":
 *         description: Perfil creado
 */
router.post("/perfiles", ctrl.postPerfil);

/**
 * @swagger
 * /acceso/perfiles/{perfilCodigo}:
 *   put:
 *     tags: [acceso]
 *     summary: Actualizar nombre/descripcion de perfil
 *     parameters:
 *       - in: path
 *         name: perfilCodigo
 *         required: true
 *         schema: { type: string, example: "VENTAS" }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre]
 *             properties:
 *               nombre: { type: string, example: "Ventas y Cotizaciones" }
 *               descripcion: { type: string, example: "Acceso comercial" }
 *     responses:
 *       "200":
 *         description: Perfil actualizado
 */
router.put("/perfiles/:perfilCodigo", ctrl.putPerfil);

/**
 * @swagger
 * /acceso/perfiles/{perfilCodigo}/estado:
 *   patch:
 *     tags: [acceso]
 *     summary: Activar o desactivar perfil
 *     parameters:
 *       - in: path
 *         name: perfilCodigo
 *         required: true
 *         schema: { type: string, example: "OPERACIONES" }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [activo]
 *             properties:
 *               activo: { type: boolean, example: false }
 *     responses:
 *       "200":
 *         description: Estado actualizado
 */
router.patch("/perfiles/:perfilCodigo/estado", ctrl.patchPerfilEstado);

/**
 * @swagger
 * /acceso/usuarios/{usuarioId}/perfiles:
 *   get:
 *     tags: [acceso]
 *     summary: Ver perfiles asignados a un usuario
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       "200":
 *         description: OK
 */
router.get("/usuarios/:usuarioId(\\d+)/perfiles", ctrl.getPerfilesUsuario);

/**
 * @swagger
 * /acceso/usuarios/{usuarioId}/perfiles:
 *   post:
 *     tags: [acceso]
 *     summary: Asignar perfil a usuario
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               perfilId: { type: integer }
 *               perfilCodigo: { type: string, example: "VENTAS" }
 *               principal: { type: boolean, example: false }
 *     responses:
 *       "200":
 *         description: OK
 */
router.post("/usuarios/:usuarioId(\\d+)/perfiles", ctrl.postAsignarPerfilUsuario);

/**
 * @swagger
 * /acceso/usuarios/{usuarioId}/perfiles/{perfilCodigo}:
 *   delete:
 *     tags: [acceso]
 *     summary: Quitar (desactivar) perfil de usuario
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: perfilCodigo
 *         required: true
 *         schema: { type: string, example: "VENTAS" }
 *     responses:
 *       "200":
 *         description: OK
 */
router.delete(
  "/usuarios/:usuarioId(\\d+)/perfiles/:perfilCodigo",
  ctrl.deletePerfilUsuario
);

module.exports = router;

