// src/modules/evento/evento.routes.rest.js
const express = require('express');
const router = express.Router();
const ctrl = require('./evento.controller');

/**
 * @swagger
 * tags:
 *   - name: evento
 *     description: Gestión de eventos
 */

/**
 * @swagger
 * /eventos:
 *   get:
 *     tags: [evento]
 *     summary: Listar eventos
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Evento'
 */
router.get('/', ctrl.getAll);

/**
 * @swagger
 * /eventos/{id}:
 *   get:
 *     tags: [evento]
 *     summary: Obtener evento por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       '200':
 *         description: Evento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Evento'
 *       '400': { description: Id inválido }
 *       '404': { description: No encontrado }
 */
router.get('/:id', ctrl.getById);

/**
 * @swagger
 * /eventos:
 *   post:
 *     tags: [evento]
 *     summary: Crear evento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventoCreate'
 *     responses:
 *       '201':
 *         description: Creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Evento'
 *       '400': { description: Error de validación }
 */
router.post('/', ctrl.create);

/**
 * @swagger
 * /eventos/{id}:
 *   put:
 *     tags: [evento]
 *     summary: Actualizar evento
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventoUpdate'
 *     responses:
 *       '200': { description: Actualizado }
 *       '400': { description: Error de validación }
 *       '404': { description: No encontrado }
 */
router.put('/:id', ctrl.update);

// Si quieres también PATCH:
// router.patch('/:id', ctrl.update);

module.exports = router;
