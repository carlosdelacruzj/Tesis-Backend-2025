// src/modules/evento/evento.routes.rest.js
const express = require('express');
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const router = express.Router();
const ctrl = require('./evento.controller');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join("uploads", "eventos");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const name = `ev_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      typeof file.mimetype === "string" && file.mimetype.startsWith("image/");
    cb(ok ? null : new Error("Solo se permiten imagenes"), ok);
  },
});

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
 * /eventos/{id}/schema:
 *   get:
 *     tags: [evento]
 *     summary: Obtener schema dinamico del tipo de evento
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       '200':
 *         description: Schema del evento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventoSchemaResponse'
 *       '400': { description: Id invalido }
 *       '404': { description: No encontrado }
 */
router.get('/:id/schema', ctrl.getSchema);

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
router.post('/', upload.single("icon"), ctrl.create);

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
router.put('/:id', upload.single("icon"), ctrl.update);

/**
 * @swagger
 * /eventos/{id}/schema:
 *   put:
 *     tags: [evento]
 *     summary: Actualizar schema dinamico del tipo de evento
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
 *             $ref: '#/components/schemas/EventoSchemaUpdate'
 *     responses:
 *       '200':
 *         description: Schema actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventoSchemaResponse'
 *       '400': { description: Error de validacion }
 *       '404': { description: No encontrado }
 */
router.put('/:id/schema', ctrl.putSchema);

// Si quieres también PATCH:
// router.patch('/:id', ctrl.update);

module.exports = router;
