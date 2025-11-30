// src/modules/inventario/equipo/equipo.routes.rest.js
const { Router } = require("express");
const ctrl = require("./equipo.controller");
require("./equipo.schema");

const router = Router();

/**
 * @swagger
 * /inventario/equipos:
 *   get:
 *     tags: [inventario - equipos]
 *     summary: Lista todos los equipos
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema: { type: integer }
 *         required: false
 *         description: Filtrar por identificador de tipo de equipo
 *       - in: query
 *         name: marca
 *         schema: { type: integer }
 *         required: false
 *         description: Filtrar por identificador de marca
 *       - in: query
 *         name: modelo
 *         schema: { type: integer }
 *         required: false
 *         description: Filtrar por identificador de modelo
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Equipo'
 */
router.get("/", ctrl.listEquipos);

/**
 * @swagger
 * /inventario/equipos/resumen:
 *   get:
 *     tags: [inventario - equipos]
 *     summary: Devuelve un resumen por tipo, marca y modelo con la cantidad de equipos
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EquipoResumen'
 */
router.get("/resumen", ctrl.summarizeEquipos);

/**
 * @swagger
 * /inventario/equipos/estados:
 *   get:
 *     tags: [inventario - equipos]
 *     summary: Lista los estados disponibles para los equipos
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EquipoEstado'
 */
router.get("/estados", ctrl.listEstadosEquipo);

/**
 * @swagger
 * /inventario/equipos/{idEquipo}/estado:
 *   patch:
 *     tags: [inventario - equipos]
 *     summary: Cambia el estado de un equipo
 *     parameters:
 *       - in: path
 *         name: idEquipo
 *         schema: { type: integer }
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EquipoEstadoUpdate'
 *     responses:
 *       "200":
 *         description: OK. Si el nuevo estado es inhabilitante (mantenimiento/baja), incluirá proyectosAfectados.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Equipo'
 */
router.patch("/:idEquipo/estado", ctrl.updateEstadoEquipo);

/**
 * @swagger
 * /inventario/equipos/{idEquipo}/proyectos-afectados:
 *   get:
 *     tags: [inventario - equipos]
 *     summary: Lista proyectos donde el equipo tiene asignaciones futuras (con fecha de inicio del evento)
 *     parameters:
 *       - in: path
 *         name: idEquipo
 *         schema: { type: integer }
 *         required: true
 *       - in: query
 *         name: fechaDesde
 *         required: false
 *         schema: { type: string, format: date }
 *         description: Por defecto hoy; devuelve asignaciones con fechaFin >= fechaDesde
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EquipoProyectoAfectado'
 */
router.get("/:idEquipo/proyectos-afectados", ctrl.listProyectosAfectados);

/**
 * @swagger
 * /inventario/equipos/{idEquipo}:
 *   get:
 *     tags: [inventario - equipos]
 *     summary: Obtiene un equipo por su identificador
 *     parameters:
 *       - in: path
 *         name: idEquipo
 *         schema: { type: integer }
 *         required: true
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Equipo'
 */
router.get("/:idEquipo", ctrl.getEquipo);

/**
 * @swagger
 * /inventario/equipos:
 *   post:
 *     tags: [inventario - equipos]
 *     summary: Crea un nuevo equipo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EquipoCreate'
 *     responses:
 *       "201":
 *         description: Creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Equipo'
 */
router.post("/", ctrl.createEquipo);

/**
 * @swagger
 * /inventario/equipos/{idEquipo}:
 *   put:
 *     tags: [inventario - equipos]
 *     summary: Actualiza un equipo existente
 *     parameters:
 *       - in: path
 *         name: idEquipo
 *         schema: { type: integer }
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EquipoUpdate'
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Equipo'
 */
router.put("/:idEquipo", ctrl.updateEquipo);

/**
 * @swagger
 * /inventario/equipos/{idEquipo}:
 *   delete:
 *     tags: [inventario - equipos]
 *     summary: Elimina un equipo existente
 *     parameters:
 *       - in: path
 *         name: idEquipo
 *         schema: { type: integer }
 *         required: true
 *     responses:
 *       "204":
 *         description: Eliminado
 */
router.delete("/:idEquipo", ctrl.deleteEquipo);

module.exports = router;
