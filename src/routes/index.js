// src/routes/index.js
const { Router } = require("express");
const router = Router();

// router.use(require("./core"));
// router.use(require("./proyecto"));
// router.use(require("./mail"));
// router.use(require("./drive"));
// router.use(require("./validacionCorreo"));

// ✅ SOLO REST
router.use("/clientes", require("../modules/cliente/cliente.routes.rest"));
router.use("/empleados", require("../modules/empleado/empleado.routes.rest"));
module.exports = router;
