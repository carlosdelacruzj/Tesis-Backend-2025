// src/modules/comprobantes/comprobantes.routes.rest.js
const { Router } = require("express");
const router = Router();
const ctrl = require("./comprobantes.controller");

// BOLETA/FACTURA
// GET /api/v1/comprobantes/vouchers/:voucherId/pdf
router.get("/vouchers/:voucherId/pdf", ctrl.downloadByVoucher);

// NOTA DE CREDITO (requiere body)
// POST /api/v1/comprobantes/vouchers/:voucherId/nota-credito/pdf
router.post("/vouchers/:voucherId/nota-credito/pdf", ctrl.downloadNotaCreditoByVoucher);

module.exports = router;
