// src/routes/index.js
const { Router } = require("express");
const router = Router();

// Modulos REST (todos se montan con /api/v1 desde app.js)
router.use("/clientes", require("../modules/cliente/cliente.routes.rest"));
router.use("/empleados", require("../modules/empleado/empleado.routes.rest"));
router.use("/servicios", require("../modules/servicio/servicio.routes.rest"));
router.use("/eventos", require("../modules/evento/evento.routes.rest"));
router.use(
  "/eventos_servicios",
  require("../modules/eventos_servicios/eventos_servicios.routes.rest")
);
router.use("/cotizaciones", require("../modules/cotizacion/cotizacion.routes.rest"));
router.use("/leads", require("../modules/lead/lead.routes.rest"));
router.use(
  "/inventario/marcas",
  require("../modules/inventario/marca/marca.routes.rest")
);
router.use(
  "/inventario/equipos",
  require("../modules/inventario/equipo/equipo.routes.rest")
);
router.use(
  "/inventario/modelos",
  require("../modules/inventario/modelo/modelo.routes.rest")
);
router.use(
  "/inventario/tipos-equipo",
  require("../modules/inventario/tipo-equipo/tipo-equipo.routes.rest")
);
router.use("/pedido", require("../modules/pedido/pedido.routes.rest"));
router.use("/proyecto", require("../modules/proyecto/proyecto.routes.rest"));
router.use("/voucher", require("../modules/voucher/voucher.routes.rest"));
router.use("/pagos", require("../modules/pagos/pagos.routes.rest"));

module.exports = router;
