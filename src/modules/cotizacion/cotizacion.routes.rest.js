const { Router } = require("express");
const ctrl = require("./cotizacion.controller");

const router = Router();

/**
 * Este router NO agrega prefijos.
 * En routes/index.js se monta como:
 *   router.use("/cotizaciones", require("../modules/cotizacion/cotizacion.routes.rest"));
 *
 * Con /api/v1 delante, quedan:
 *   GET    /api/v1/cotizaciones
 *   GET    /api/v1/cotizaciones/:id
 *   GET    /api/v1/cotizaciones/:id/pdf
 *   POST   /api/v1/cotizaciones/:id/pdf   (permite body)
 *   POST   /api/v1/cotizaciones/public
 *   POST   /api/v1/cotizaciones/admin
 *   PUT    /api/v1/cotizaciones/:id
 *   DELETE /api/v1/cotizaciones/:id
 *   PUT    /api/v1/cotizaciones/:id/estado
 *
 * NO definir aquí alias /api/cotizacion/:id/pdf.
 * Si necesitas alias, montalos en app.js.
 */

// Listar
router.get("/", ctrl.getAll);

// Obtener por ID
router.get("/:id(\\d+)", ctrl.getById);

// Descargar PDF (GET)
router.get("/:id(\\d+)/pdf", ctrl.downloadPdf);

// Descargar PDF (POST con body: logoBase64, firmaBase64, etc.)
router.post("/:id(\\d+)/pdf", ctrl.downloadPdf);

// Crear (public)
router.post("/public", ctrl.createPublic);

// Crear (admin)
router.post("/admin", ctrl.createAdmin);

// Actualizar
router.put("/:id(\\d+)", ctrl.update);

// Eliminar
router.delete("/:id(\\d+)", ctrl.remove);

// Cambiar estado
router.put("/:id(\\d+)/estado", ctrl.updateEstado);

module.exports = router;
