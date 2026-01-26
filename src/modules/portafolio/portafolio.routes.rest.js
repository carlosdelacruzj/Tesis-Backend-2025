// src/modules/portafolio/portafolio.routes.rest.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const ctrl = require("./portafolio.controller");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join("uploads", "portafolio");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const name = `pf_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = typeof file.mimetype === "string" && file.mimetype.startsWith("image/");
    cb(ok ? null : new Error("Solo se permiten imagenes"), ok);
  },
});

/**
 * @swagger
 * tags:
 *   - name: portafolio
 *     description: Gestion de portafolio
 */

/**
 * @swagger
 * /portafolio/eventos:
 *   get:
 *     tags: [portafolio]
 *     summary: Listar tipos de evento con visibilidad de portafolio
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PortafolioEvento'
 */
router.get("/eventos", ctrl.getEventos);

/**
 * @swagger
 * /portafolio/eventos/{id}/mostrar:
 *   patch:
 *     tags: [portafolio]
 *     summary: Mostrar u ocultar un tipo de evento en portafolio
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
 *             type: object
 *             properties:
 *               mostrar: { type: integer, enum: [0, 1] }
 *     responses:
 *       '200': { description: Actualizado }
 *       '400': { description: Error de validacion }
 *       '404': { description: No encontrado }
 */
router.patch("/eventos/:id/mostrar", ctrl.patchEventoMostrar);

/**
 * @swagger
 * /portafolio/publico:
 *   get:
 *     tags: [portafolio]
 *     summary: Portafolio publico por tipos visibles
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PortafolioPublico'
 */
router.get("/publico", ctrl.getPublico);

/**
 * @swagger
 * /portafolio/imagenes:
 *   get:
 *     tags: [portafolio]
 *     summary: Listar imagenes de portafolio
 *     parameters:
 *       - in: query
 *         name: eventoId
 *         schema: { type: integer }
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PortafolioImagen'
 */
router.get("/imagenes", ctrl.getImagenes);

/**
 * @swagger
 * /portafolio/imagenes:
 *   post:
 *     tags: [portafolio]
 *     summary: Subir imagenes de portafolio (1 o varias)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/PortafolioImagenCreate'
 *     responses:
 *       '201': { description: Creado }
 *       '400': { description: Error de validacion }
 */
router.post("/imagenes", upload.array("files", 50), ctrl.postImagenesLote);

/**
 * @swagger
 * /portafolio/imagenes/{id}:
 *   put:
 *     tags: [portafolio]
 *     summary: Actualizar imagen de portafolio
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/PortafolioImagenUpdate'
 *     responses:
 *       '200': { description: Actualizado }
 *       '400': { description: Error de validacion }
 *       '404': { description: No encontrado }
 */
router.put("/imagenes/:id", upload.single("file"), ctrl.putImagen);

/**
 * @swagger
 * /portafolio/imagenes/{id}:
 *   delete:
 *     tags: [portafolio]
 *     summary: Eliminar imagen de portafolio
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       '200': { description: Eliminado }
 *       '404': { description: No encontrado }
 */
router.delete("/imagenes/:id", ctrl.deleteImagen);

module.exports = router;
