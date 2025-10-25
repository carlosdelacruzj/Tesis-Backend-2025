// src/modules/inventario/marca/marca.routes.rest.js
const { Router } = require("express");
const ctrl = require("./marca.controller");
require("./marca.schema");

const router = Router();

/**
 * @swagger
 * /inventario/marcas:
 *   get:
 *     tags: [inventario - marcas]
 *     summary: Lista todas las marcas
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Marca'
 */
router.get("/", ctrl.listMarcas);

/**
 * @swagger
 * /inventario/marcas/{idMarca}:
 *   get:
 *     tags: [inventario - marcas]
 *     summary: Obtiene una marca por su identificador
 *     parameters:
 *       - in: path
 *         name: idMarca
 *         schema: { type: integer }
 *         required: true
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Marca'
 */
router.get("/:idMarca", ctrl.getMarca);

/**
 * @swagger
 * /inventario/marcas:
 *   post:
 *     tags: [inventario - marcas]
 *     summary: Crea una nueva marca
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MarcaCreate'
 *     responses:
 *       "201":
 *         description: Creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Marca'
 */
router.post("/", ctrl.createMarca);

/**
 * @swagger
 * /inventario/marcas/{idMarca}:
 *   put:
 *     tags: [inventario - marcas]
 *     summary: Actualiza el nombre de una marca
 *     parameters:
 *       - in: path
 *         name: idMarca
 *         schema: { type: integer }
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MarcaUpdate'
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Marca'
 */
router.put("/:idMarca", ctrl.updateMarca);

/**
 * @swagger
 * /inventario/marcas/{idMarca}:
 *   delete:
 *     tags: [inventario - marcas]
 *     summary: Elimina una marca existente
 *     parameters:
 *       - in: path
 *         name: idMarca
 *         schema: { type: integer }
 *         required: true
 *     responses:
 *       "204":
 *         description: Eliminado
 */
router.delete("/:idMarca", ctrl.deleteMarca);

module.exports = router;
