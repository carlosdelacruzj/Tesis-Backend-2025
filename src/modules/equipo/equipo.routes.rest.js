// src/modules/equipo/equipo.routes.rest.js
const { Router } = require("express");
const ctrl = require("./equipo.controller");

const router = Router();

/**
 * @swagger
 * /equipo:
 *   get:
 *     tags: [equipo]
 *     summary: Listar todos los equipos
 *     responses:
 *       '200': { description: OK }
 */
router.get("/", ctrl.getAllEquipo);

/**
 * @swagger
 * /equipo/by-tipo/{idTipoEquipo}:
 *   get:
 *     tags: [equipo]
 *     summary: Listar equipos por tipo
 *     parameters:
 *       - in: path
 *         name: idTipoEquipo
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '200': { description: OK }
 */
router.get("/by-tipo/:idTipoEquipo", ctrl.getByTipoEquipo);

/**
 * @swagger
 * /equipo/by-grupo/{tipoEquipo}/{marca}/{modelo}:
 *   get:
 *     tags: [equipo]
 *     summary: Listar equipos filtrados por tipo, marca y modelo
 *     parameters:
 *       - in: path
 *         name: tipoEquipo
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: marca
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: modelo
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '200': { description: OK }
 */
router.get("/by-grupo/:tipoEquipo/:marca/:modelo", ctrl.getAllEquiposByIdGroup);

/**
 * @swagger
 * /equipo/grupos:
 *   get:
 *     tags: [equipo]
 *     summary: Listar agrupación de equipos (para combos/filtros)
 *     responses:
 *       '200': { description: OK }
 */
router.get("/grupos", ctrl.getAllEquiposGroup);

/**
 * @swagger
 * /equipo/marcas:
 *   get:
 *     tags: [equipo]
 *     summary: Listar todas las marcas
 *     responses:
 *       '200': { description: OK }
 */
router.get("/marcas", ctrl.getAllMarca);

/**
 * @swagger
 * /equipo/modelos/{marca}/{tipo}:
 *   get:
 *     tags: [equipo]
 *     summary: Listar modelos por marca y tipo
 *     parameters:
 *       - in: path
 *         name: marca
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: tipo
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '200': { description: OK }
 */
router.get("/modelos/:marca/:tipo", ctrl.getAllModelo);

/**
 * @swagger
 * /equipo:
 *   post:
 *     tags: [equipo]
 *     summary: Registrar equipo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EquipoCreate'
 *     responses:
 *       '201': { description: Creado }
 */
router.post("/", ctrl.postEquipo);

/**
 * @swagger
 * /equipo/{idEquipo}/estado:
 *   put:
 *     tags: [equipo]
 *     summary: Cambiar el estado de un equipo (1=Disponible, 2=En uso, 3=Mantenimiento)
 *     parameters:
 *       - in: path
 *         name: idEquipo
 *         required: true
 *         schema: { type: string }
 *         description: Código del equipo (ej. CAM-0001)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EquipoUpdateEstado'
 *     responses:
 *       '200': { description: Actualizado }
 */
router.put("/:idEquipo/estado", ctrl.putEstadoEquipo);

/**
 * @swagger
 * /equipo/contadores/{idModelo}:
 *   get:
 *     tags: [equipo]
 *     summary: Obtener contadores de equipos por modelo y estado
 *     parameters:
 *       - in: path
 *         name: idModelo
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '200': { description: OK }
 */
router.get("/contadores/:idModelo", ctrl.getAllContadoresEquiposEstado);

/**
 * @swagger
 * /equipo/existe/{numSerie}:
 *   get:
 *     tags: [equipo]
 *     summary: Validar si existe un equipo por número de serie
 *     parameters:
 *       - in: path
 *         name: numSerie
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       '200': { description: OK }
 */
router.get("/existe/:numSerie", ctrl.getExistEquipo);

module.exports = router;
