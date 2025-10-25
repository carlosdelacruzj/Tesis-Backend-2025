// src/modules/inventario/modelo/modelo.routes.rest.js
const { Router } = require("express");
const ctrl = require("./modelo.controller");
require("./modelo.schema");

const router = Router();

/**
 * @swagger
 * /inventario/modelos:
 *   get:
 *     tags: [inventario - modelos]
 *     summary: Lista todos los modelos
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Modelo'
 */
router.get("/", ctrl.listModelos);

/**
 * @swagger
 * /inventario/modelos/{idModelo}:
 *   get:
 *     tags: [inventario - modelos]
 *     summary: Obtiene un modelo por su identificador
 *     parameters:
 *       - in: path
 *         name: idModelo
 *         schema: { type: integer }
 *         required: true
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Modelo'
 */
router.get("/:idModelo", ctrl.getModelo);

/**
 * @swagger
 * /inventario/modelos:
 *   post:
 *     tags: [inventario - modelos]
 *     summary: Crea un nuevo modelo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ModeloCreate'
 *     responses:
 *       "201":
 *         description: Creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Modelo'
 */
router.post("/", ctrl.createModelo);

/**
 * @swagger
 * /inventario/modelos/{idModelo}:
 *   put:
 *     tags: [inventario - modelos]
 *     summary: Actualiza un modelo existente
 *     parameters:
 *       - in: path
 *         name: idModelo
 *         schema: { type: integer }
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ModeloUpdate'
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Modelo'
 */
router.put("/:idModelo", ctrl.updateModelo);

/**
 * @swagger
 * /inventario/modelos/{idModelo}:
 *   delete:
 *     tags: [inventario - modelos]
 *     summary: Elimina un modelo existente
 *     parameters:
 *       - in: path
 *         name: idModelo
 *         schema: { type: integer }
 *         required: true
 *     responses:
 *       "204":
 *         description: Eliminado
 */
router.delete("/:idModelo", ctrl.deleteModelo);

module.exports = router;
