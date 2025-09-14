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
router.use("/servicios", require("../modules/servicio/servicio.routes.rest"));
router.use("/eventos", require("../modules/evento/evento.routes.rest"));
router.use("/eventos_servicios", require("../modules/eventos_servicios/eventos_servicios.routes.rest"));


module.exports = router;
