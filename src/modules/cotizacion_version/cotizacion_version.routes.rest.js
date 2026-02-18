const express = require("express");
const router = express.Router();
const ctrl = require("./cotizacion_version.controller");
const requireProfile = require("../../middlewares/require-profile");

router.use(requireProfile("ADMIN", "VENTAS"));

router.get("/:versionId/pdf", ctrl.downloadPdfByVersionId);
router.get("/:versionId", ctrl.getById);

module.exports = router;
