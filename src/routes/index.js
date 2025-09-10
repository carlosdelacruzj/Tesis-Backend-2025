// src/routes/index.js
const { Router } = require("express");
const router = Router();

router.use(require("./core"));
router.use(require("./proyecto"));
router.use(require("./mail"));
router.use(require("./drive"));
router.use(require("./validacionCorreo"));

module.exports = router;
