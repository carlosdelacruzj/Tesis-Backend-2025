const express = require("express");
const router = express.Router();
const ctrl = require("./contrato.controller");
const requireProfile = require("../../middlewares/require-profile");

router.use(requireProfile("ADMIN", "VENTAS"));

router.get("/", ctrl.listGestion);
router.get("/pedido/:pedidoId", ctrl.listContratosByPedido);
router.get("/pedido/:pedidoId/vigente", ctrl.getContratoVigenteByPedido);
router.get("/:id/pdf", ctrl.downloadContratoPdfById);
router.get("/:id", ctrl.getContratoById);

module.exports = router;
