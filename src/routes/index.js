// src/routes/index.js
const { Router } = require("express");
const router = Router();

// Solo los que ya montabas en app.js
router.use(require("./core"));
router.use(require("./proyecto"));
router.use(require("./mail"));
// Más adelante, cuando confirmemos que exportan un router válido:
// router.use(require("./mail"));
// router.use(require("./drive"));
// router.use(require("./validacionCorreo"));

module.exports = router;
