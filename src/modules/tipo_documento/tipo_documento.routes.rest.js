const { Router } = require("express");
const ctrl = require("./tipo_documento.controller");

const router = Router();

/**
 * @swagger
 * /tipos-documento:
 *   get:
 *     tags: [tipo_documento]
 *     summary: Listar tipos de documento
 *     responses: { '200': { description: OK } }
 */
router.get("/", ctrl.getAll);

module.exports = router;
