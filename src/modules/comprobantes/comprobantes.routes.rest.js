// src/modules/comprobantes/comprobantes.routes.rest.js
const { Router } = require("express");
const router = Router();
const ctrl = require("./comprobantes.controller");

// GET /api/v1/comprobantes/vouchers/:voucherId/pdf
router.get("/vouchers/:voucherId/pdf", ctrl.downloadByVoucher);

module.exports = router;