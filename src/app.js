// src/app.js
require('dotenv').config();  // debe ser la PRIMERA línea

const express = require("express");
const app = express();

var cors = require("cors");

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const pool = require("./database");

const jwt = require("jsonwebtoken");

//Extended
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "TP-2021",
      description: "Api de TP2021 ",
      contact: {
        name: "r.k.villanueva.laurente@gmail.com",
      },
      servers: ["http://localhost:3000"],
    },
  },
  //rutas
  apis: ["src/app.js", "src/Routes/core.js", "src/Routes/proyecto.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-doc", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * # tags are used for organizing operations
 *tags:
 *- name: admins
 *  description: Secured Admin-only calls
 *- name: users
 *  description: Secured Users-only calls
 *- name: developers
 *  description: Operations available to regular developers
 */

//settings
app.set("port", process.env.PORT || 3000);

//Middlewares
app.use(cors());

app.use(express.json({ extended: false }));

app.use((req, res, next) => {
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
    console.log("token");
    const token = req.query.token || req.headers["authorization"];

    if (typeof token !== "undefined") {
      jwt.verify(token, "my_secret_key", (err, data) => {
        if (err) {
          jwt.verify(token, "my_admin_secret_key", (err, data) => {
            if (err) {
              jwt.verify(token, "my_empresa_secret_key", (err, data) => {
                if (err) {
                  return res.json({
                    success: false,
                    message: "Autenticación fallida!",
                  });
                } else {
                  req.data = data;
                  next();
                }
              });
            } else {
              req.data = data;
              next();
            }
          });
        } else {
          req.data = data;
          next();
        }
      });
    } else {
      return res.status(403).send({
        success: false,
        message: "no existe el token",
      });
    }
  }
  if (nousantoken) {
    console.log("sin token");
    next();
  }
  if (req.url.includes("/admin")) {
    const token = req.query.token || req.headers["authorization"];
    if (typeof token !== "undefined") {
      jwt.verify(token, "my_admin_secret_key", (err, data) => {
        if (err) {
          return res.json({
            success: false,
            message: "Autenticación fallida!",
          });
        } else {
          req.data = data;
          next();
        }
      });
    } else {
      return res.status(403).send({
        success: false,
        message: "no existe el token",
      });
    }
  }
  if (req.url.includes("/empresa")) {
    const token = req.query.token || req.headers["authorization"];
    if (typeof token !== "undefined") {
      jwt.verify(token, "my_empresa_secret_key", (err, data) => {
        if (err) {
          jwt.verify(token, "my_admin_secret_key", (err, data) => {
            if (err) {
              return res.json({
                success: false,
                message: "Autenticación fallida!",
              });
            } else {
              req.data = data;
              next();
            }
          });
        } else {
          req.data = data;
          next();
        }
      });
    } else {
      return res.status(403).send({
        success: false,
        message: "no existe el token",
      });
    }
  }
});

//Routes
app.use(require("./Routes/core"));
app.use(require("./Routes/proyecto"));

app.listen(app.get("port"), () => {
  console.log("Server on port ", app.get("port"));
});
