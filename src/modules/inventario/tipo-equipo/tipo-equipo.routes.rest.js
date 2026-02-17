// src/modules/inventario/tipo-equipo/tipo-equipo.routes.rest.js
const { Router } = require("express");
const ctrl = require("./tipo-equipo.controller");
const requireProfile = require("../../../middlewares/require-profile");
require("./tipo-equipo.schema");

const router = Router();
router.use(requireProfile("ADMIN"));

/**
 * @swagger
 * /inventario/tipos-equipo:
 *   get:
 *     tags: [inventario - tipos-equipo]
 *     summary: Lista todos los tipos de equipo
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TipoEquipo'
 */
router.get("/", ctrl.listTipos);

/**
 * @swagger
 * /inventario/tipos-equipo/{idTipoEquipo}:
 *   get:
 *     tags: [inventario - tipos-equipo]
 *     summary: Obtiene un tipo de equipo por su identificador
 *     parameters:
 *       - in: path
 *         name: idTipoEquipo
 *         schema: { type: integer }
 *         required: true
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TipoEquipo'
 */
router.get("/:idTipoEquipo", ctrl.getTipo);

/**
 * @swagger
 * /inventario/tipos-equipo:
 *   post:
 *     tags: [inventario - tipos-equipo]
 *     summary: Crea un nuevo tipo de equipo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TipoEquipoCreate'
 *     responses:
 *       "201":
 *         description: Creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TipoEquipo'
 */
router.post("/", ctrl.createTipo);

/**
 * @swagger
 * /inventario/tipos-equipo/{idTipoEquipo}:
 *   put:
 *     tags: [inventario - tipos-equipo]
 *     summary: Actualiza el nombre de un tipo de equipo
 *     parameters:
 *       - in: path
 *         name: idTipoEquipo
 *         schema: { type: integer }
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TipoEquipoUpdate'
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TipoEquipo'
 */
router.put("/:idTipoEquipo", ctrl.updateTipo);

/**
 * @swagger
 * /inventario/tipos-equipo/{idTipoEquipo}:
 *   delete:
 *     tags: [inventario - tipos-equipo]
 *     summary: Elimina un tipo de equipo existente
 *     parameters:
 *       - in: path
 *         name: idTipoEquipo
 *         schema: { type: integer }
 *         required: true
 *     responses:
 *       "204":
 *         description: Eliminado
 */
router.delete("/:idTipoEquipo", ctrl.deleteTipo);

module.exports = router;
