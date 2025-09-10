// src/middlewares/auth.js
const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  // Bypass para rutas públicas
  if (
    req.path === "/health" ||
    req.path.startsWith("/api-doc") || // Swagger UI
    req.path === "/favicon.ico"
  ) {
    return next();
  }
  let usantoken =
    !req.url.includes("/send-email") &&
    !req.url.includes("/enviarNotificacion") &&
    !req.url.includes("/proyecto/consulta/getAllProyecto") &&
    !req.url.includes("/proyecto/registro/postProyecto") &&
    !req.url.includes("/pedido/consulta/getAllPedido") &&
    !req.url.includes("/eventos/consulta/getAllEvent") &&
    !req.url.includes("/proyecto/consulta/getByIdProyecto") &&
    !req.url.includes("/proyecto/consulta/getAllAsignarEquipos") &&
    !req.url.includes("/empleado/consulta/getAllEmpleados") &&
    !req.url.includes("/equipo/consulta/getAllTipoEquipo") &&
    !req.url.includes("/equipo/consulta/getAllEquipo") &&
    !req.url.includes("/equipo/consulta/getByTipoEquipo") &&
    !req.url.includes("/eventos_servicios/consulta/getAllServiciosByEvento") &&
    !req.url.includes("/pedido/consulta/getIndexPedido") &&
    !req.url.includes("/pedido/consulta/getByIDPedido") &&
    !req.url.includes("/cliente/consulta/getDataCliente") &&
    !req.url.includes("/pedido/consulta/getLastEstadoPedido") &&
    !req.url.includes("/proyecto/consulta/getAllPedidosContratado") &&
    !req.url.includes("/eventos_servicios/registro/postEventoxServicio") &&
    !req.url.includes("/pedido/registro/postPedido") &&
    !req.url.includes("/eventos_servicios/actualiza/putByIdEventoxServicio") &&
    !req.url.includes("/pedido/actualiza/putByIdPedido") &&
    !req.url.includes("/servicio/consulta/getAllServicios") &&
    !req.url.includes("/proyecto/registro/postAsignarPersonalEquipo") &&
    !req.url.includes("/proyecto/actualiza/putByIdAsignarPersonalEquipo") &&
    !req.url.includes("/proyecto/consulta/getAsignarEquiposById") &&
    !req.url.includes("/proyecto/consulta/getAllEventosProyectos") &&
    !req.url.includes("/contrato/consulta/getAllContratos") &&
    !req.url.includes("/proyecto/delete/deleteAsignarEquipoById") &&
    !req.url.includes("/proyecto/consulta/getAllEquiposFiltrados") &&
    !req.url.includes("/mobile/consulta/getAllEquiposPendientes") &&
    !req.url.includes("/mobile/consulta/getAllEventosMonthByEmpl") &&
    !req.url.includes("/mobile/consulta/getAllEventosTodayByEmpl") &&
    !req.url.includes("/proyecto/actualiza/putProyectoById") &&
    !req.url.includes("/eventos_servicios/consulta/getEventoxServicioById") &&
    !req.url.includes("/proyecto/consulta/getAllEventosProyectoById") &&
    !req.url.includes("/equipo/consulta/getAllEquiposByIdGroup") &&
    !req.url.includes("/equipo/consulta/getAllEquiposGroup") &&
    !req.url.includes("/equipo/consulta/getAllMarca") &&
    !req.url.includes("/equipo/consulta/getAllModelo") &&
    !req.url.includes("/equipo/registro/postEquipo") &&
    !req.url.includes("/empleado/consulta/getAllEmpleadosDisponible") &&
    !req.url.includes("/empleado/consulta/getAllEmpleadosList") &&
    !req.url.includes("/empleado/consulta/getEmpleadoByID") &&
    !req.url.includes("/empleado/registro/postEmpleado") &&
    !req.url.includes("/mobile/consulta/getAllEventosProgramadosByEmpl") &&
    !req.url.includes("/mobile/consulta/getProyectoDetail") &&
    !req.url.includes("/empleado/consulta/getAllCargo") &&
    !req.url.includes("/voucher/registro/postVoucher") &&
    !req.url.includes("/voucher/consulta/getVoucherByPedido") &&
    !req.url.includes("/voucher/consulta/getAllVoucherByPedido") &&
    !req.url.includes("/voucher/consulta/getAllMetodoPago") &&
    !req.url.includes("/voucher/consulta/getAllEstadoVoucher") &&
    !req.url.includes("/postEmpleado2") &&
    !req.url.includes("/postVerificarllegada") &&
    !req.url.includes("/postVoucher") &&
    !req.url.includes("/postContrato") &&
    !req.url.includes("/loginTrabajador") &&
    !req.url.includes("/loginAdmin") &&
    !req.url.includes("/actualizartokenEmpleado") &&
    !req.url.includes("/actualizartokenAdmin") &&
    !req.url.includes("/registrartokenAdmin") &&
    !req.url.includes("/registrartokenEmpleado") &&
    !req.url.includes("/contrato/consulta/getAllContratosByPedido") &&
    !req.url.includes("/empleado/actualiza/putEmpleadoById") &&
    !req.url.includes("/equipo/actualiza/putEstadoEquipo") &&
    !req.url.includes("/equipo/consulta/getAllContadoresEquiposEstado") &&
    !req.url.includes("/cliente/registro/postCliente") &&
    !req.url.includes("/cliente/consulta/getAllCliente") &&
    !req.url.includes("/cliente/actualiza/putClienteById") &&
    !req.url.includes("/equipo/consulta/getExistEquipo") &&
    !req.url.includes("/eventos/consulta/getDetailEvento") &&
    !req.url.includes("/cliente/consulta/getByIdCliente") &&
    !req.url.includes("/usuario/consulta/getIniciarSesion") &&
    !req.url.includes("/usuario/consulta/envioCorreoValidacion") &&
    !req.url.includes("/usuario/consulta/getValidacionCodex") &&
    !req.url.includes("/usuario/actualiza/actualizarPassword") &&
    !req.url.includes("/equiposAlquilado/consulta/getAllEquiposAlquilado") &&
    !req.url.includes("/equiposAlquilado/consulta/getEquipoAlquiladoByID") &&
    !req.url.includes("/dashboard/consulta/getReportEventosContado") &&
    !req.url.includes("/dashboard/consulta/getReporteListaEquipo") &&
    !req.url.includes("/dashboard/consulta/getReporteEstadoProyectos") &&
    !req.url.includes("/equiposAlquilado/registro/postEquipoAlquilado") &&
    !req.url.includes("/dashboard/consulta/getReporteGanancias") &&
    !req.url.includes("/dashboard/consulta/getReporteProyectosXMes") &&
    !req.url.includes("/mobile/consulta/getIniciarSecionTrabajador") &&
    !req.url.includes("/perfiles/actualiza/putPermiso") &&
    !req.url.includes("/perfiles/registro/postPermiso") &&
    !req.url.includes("/perfiles/consulta/getAllRoles") &&
    !req.url.includes("/perfiles/consulta/getByIdPerfil") &&
    !req.url.includes("/perfiles/consulta/getAllPerfiles") &&
    !req.url.includes("/mobile/consulta/getNotificaciones") &&
    !req.url.includes("/mobile/consulta/getAllReportes") &&
    !req.url.includes("/mobile/registro/postNotificacion") &&
    !req.url.includes("/mobile/registro/postReporte") &&
    !req.url.includes("/mobile/consulta/getReportesID") &&
    !req.url.includes("/mobile/consulta/equiposListPendientes") &&
    !req.url.includes("/mobile/consulta/getAllEquiposAsignados") &&
    !req.url.includes("/mobile/actualiza/putEquipoAlquiladoID") &&
    !req.url.includes("/voucher/consulta/getAllPedidoVoucher");

  let nousantoken =
    req.url.includes("/send-email") ||
    req.url.includes("/enviarNotificacion") ||
    req.url.includes("/proyecto/consulta/getAllProyecto") ||
    req.url.includes("/proyecto/registro/postProyecto") ||
    req.url.includes("/pedido/consulta/getAllPedido") ||
    req.url.includes("/eventos/consulta/getAllEvent") ||
    req.url.includes("/proyecto/consulta/getByIdProyecto") ||
    req.url.includes("/proyecto/consulta/getAllAsignarEquipos") ||
    req.url.includes("/empleado/consulta/getAllEmpleados") ||
    req.url.includes("/equipo/consulta/getAllTipoEquipo") ||
    req.url.includes("/equipo/consulta/getAllEquipo") ||
    req.url.includes("/equipo/consulta/getByTipoEquipo") ||
    req.url.includes("/eventos_servicios/consulta/getAllServiciosByEvento") ||
    req.url.includes("/pedido/consulta/getIndexPedido") ||
    req.url.includes("/pedido/consulta/getByIDPedido") ||
    req.url.includes("/cliente/consulta/getDataCliente") ||
    req.url.includes("/pedido/consulta/getLastEstadoPedido") ||
    req.url.includes("/proyecto/consulta/getAllPedidosContratado") ||
    req.url.includes("/eventos_servicios/registro/postEventoxServicio") ||
    req.url.includes("/pedido/registro/postPedido") ||
    req.url.includes("/eventos_servicios/actualiza/putByIdEventoxServicio") ||
    req.url.includes("/pedido/actualiza/putByIdPedido") ||
    req.url.includes("/servicio/consulta/getAllServicios") ||
    req.url.includes("/proyecto/registro/postAsignarPersonalEquipo") ||
    req.url.includes("/proyecto/actualiza/putByIdAsignarPersonalEquipo") ||
    req.url.includes("/proyecto/consulta/getAsignarEquiposById") ||
    req.url.includes("/proyecto/consulta/getAllEventosProyectos") ||
    req.url.includes("/contrato/consulta/getAllContratos") ||
    req.url.includes("/proyecto/delete/deleteAsignarEquipoById") ||
    req.url.includes("/proyecto/consulta/getAllEquiposFiltrados") ||
    req.url.includes("/mobile/consulta/getAllEquiposPendientes") ||
    req.url.includes("/mobile/consulta/getAllEventosMonthByEmpl") ||
    req.url.includes("/mobile/consulta/getAllEventosTodayByEmpl") ||
    req.url.includes("/proyecto/actualiza/putProyectoById") ||
    req.url.includes("/eventos_servicios/consulta/getEventoxServicioById") ||
    req.url.includes("/proyecto/consulta/getAllEventosProyectoById") ||
    req.url.includes("equipo/consulta/getAllEquiposByIdGroup") ||
    req.url.includes("/equipo/consulta/getAllEquiposGroup") ||
    req.url.includes("/equipo/consulta/getAllMarca") ||
    req.url.includes("/equipo/consulta/getAllModelo") ||
    req.url.includes("/equipo/registro/postEquipo") ||
    req.url.includes("/empleado/consulta/getAllEmpleadosDisponible") ||
    req.url.includes("/empleado/consulta/getAllEmpleadosList") ||
    req.url.includes("/empleado/consulta/getEmpleadoByID") ||
    req.url.includes("/empleado/registro/postEmpleado") ||
    req.url.includes("/mobile/consulta/getAllEventosProgramadosByEmpl") ||
    req.url.includes("/mobile/consulta/getProyectoDetail") ||
    req.url.includes("/empleado/consulta/getAllCargo") ||
    req.url.includes("/voucher/registro/postVoucher") ||
    req.url.includes("/voucher/consulta/getVoucherByPedido") ||
    req.url.includes("/voucher/consulta/getAllVoucherByPedido") ||
    req.url.includes("/voucher/consulta/getAllEstadoVoucher") ||
    req.url.includes("/voucher/consulta/getAllMetodoPago") ||
    req.url.includes("/postEmpleado2") ||
    req.url.includes("/postVerificarllegada") ||
    req.url.includes("/postVoucher") ||
    req.url.includes("/postContrato") ||
    req.url.includes("/loginTrabajador") ||
    req.url.includes("/loginAdmin") ||
    req.url.includes("/actualizartokenEmpleado") ||
    req.url.includes("/actualizartokenAdmin") ||
    req.url.includes("/registrartokenAdmin") ||
    req.url.includes("/registrartokenEmpleado") ||
    req.url.includes("/contrato/consulta/getAllContratosByPedido") ||
    req.url.includes("/empleado/actualiza/putEmpleadoById") ||
    req.url.includes("/equipo/actualiza/putEstadoEquipo") ||
    req.url.includes("/equipo/consulta/getAllContadoresEquiposEstado") ||
    req.url.includes("/cliente/registro/postCliente") ||
    req.url.includes("/cliente/consulta/getAllCliente") ||
    req.url.includes("/equipo/consulta/getExistEquipo") ||
    req.url.includes("/cliente/actualiza/putClienteById") ||
    req.url.includes("/eventos/consulta/getDetailEvento") ||
    req.url.includes("/cliente/consulta/getByIdCliente") ||
    req.url.includes("/usuario/consulta/getIniciarSesion") ||
    req.url.includes("/usuario/consulta/envioCorreoValidacion") ||
    req.url.includes("/usuario/consulta/getValidacionCodex") ||
    req.url.includes("/usuario/actualiza/actualizarPassword") ||
    req.url.includes("/equiposAlquilado/consulta/getAllEquiposAlquilado") ||
    req.url.includes("/equiposAlquilado/consulta/getEquipoAlquiladoByID") ||
    req.url.includes("/dashboard/consulta/getReportEventosContado") ||
    req.url.includes("/dashboard/consulta/getReporteListaEquipo") ||
    req.url.includes("/dashboard/consulta/getReporteEstadoProyectos") ||
    req.url.includes("/equiposAlquilado/registro/postEquipoAlquilado") ||
    req.url.includes("/dashboard/consulta/getReporteGanancias") ||
    req.url.includes("/dashboard/consulta/getReporteProyectosXMes") ||
    req.url.includes("/mobile/consulta/getIniciarSecionTrabajador") ||
    req.url.includes("/perfiles/actualiza/putPermiso") ||
    req.url.includes("/perfiles/registro/postPermiso") ||
    req.url.includes("/perfiles/consulta/getAllRoles") ||
    req.url.includes("/perfiles/consulta/getByIdPerfil") ||
    req.url.includes("/perfiles/consulta/getAllPerfiles") ||
    req.url.includes("/mobile/consulta/getNotificaciones") ||
    req.url.includes("/mobile/consulta/getAllReportes") ||
    req.url.includes("/mobile/registro/postNotificacion") ||
    req.url.includes("/mobile/registro/postReporte") ||
    req.url.includes("/mobile/consulta/getReportesID") ||
    req.url.includes("/mobile/consulta/equiposListPendientes") ||
    req.url.includes("/mobile/consulta/getAllEquiposAsignados") ||
    req.url.includes("/mobile/actualiza/putEquipoAlquiladoID") ||
    req.url.includes("/voucher/consulta/getAllPedidoVoucher");

  if (usantoken) {
    const token = req.query.token || req.headers["authorization"];
    if (typeof token !== "undefined") {
      // Usamos env con fallback a tus valores actuales
      const USER_SECRET = process.env.JWT_SECRET || "my_secret_key";
      const ADMIN_SECRET =
        process.env.JWT_ADMIN_SECRET || "my_admin_secret_key";
      const EMPRESA_SECRET =
        process.env.JWT_EMPRESA_SECRET || "my_empresa_secret_key";

      jwt.verify(token, USER_SECRET, (err, data) => {
        if (!err) {
          req.data = data;
          return next();
        }
        jwt.verify(token, ADMIN_SECRET, (err2, data2) => {
          if (!err2) {
            req.data = data2;
            return next();
          }
          jwt.verify(token, EMPRESA_SECRET, (err3, data3) => {
            if (!err3) {
              req.data = data3;
              return next();
            }
            return res.json({
              success: false,
              message: "Autenticación fallida!",
            });
          });
        });
      });
    } else {
      return res
        .status(403)
        .send({ success: false, message: "no existe el token" });
    }
  }

  if (nousantoken) {
    next();
  }
  if (req.url.includes("/admin")) {
    const token = req.query.token || req.headers["authorization"];
    if (typeof token !== "undefined") {
      const ADMIN_SECRET =
        process.env.JWT_ADMIN_SECRET || "my_admin_secret_key";
      jwt.verify(token, ADMIN_SECRET, (err, data) => {
        if (err)
          return res.json({
            success: false,
            message: "Autenticación fallida!",
          });
        req.data = data;
        return next();
      });
    } else {
      return res
        .status(403)
        .send({ success: false, message: "no existe el token" });
    }
  }
  if (req.url.includes("/empresa")) {
    const token = req.query.token || req.headers["authorization"];
    if (typeof token !== "undefined") {
      const EMPRESA_SECRET =
        process.env.JWT_EMPRESA_SECRET || "my_empresa_secret_key";
      const ADMIN_SECRET =
        process.env.JWT_ADMIN_SECRET || "my_admin_secret_key";
      jwt.verify(token, EMPRESA_SECRET, (err, data) => {
        if (!err) {
          req.data = data;
          return next();
        }
        jwt.verify(token, ADMIN_SECRET, (err2, data2) => {
          if (err2)
            return res.json({
              success: false,
              message: "Autenticación fallida!",
            });
          req.data = data2;
          return next();
        });
      });
    } else {
      return res
        .status(403)
        .send({ success: false, message: "no existe el token" });
    }
  }
}
module.exports = authMiddleware;
