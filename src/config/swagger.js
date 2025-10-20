// src/config/swagger.js
module.exports = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Tesis 2025",
      version: "1.0.0",
      description: "API para la gestion de la tesis 2025",
      contact: {
        name: "delacruzcarlos1405@gmail.com",
      },
    },
    servers: [
      { url: "/api/v1" },
    ],
    tags: [
      { name: "auth", description: "Autenticacion (desarrollo)" },
      { name: "cliente", description: "Gestion de clientes" },
      { name: "empleado", description: "Gestion de empleados" },
      { name: "servicio", description: "Servicios disponibles" },
      { name: "evento", description: "Gestion de eventos" },
      { name: "eventos_servicios", description: "Relacion eventos/servicios" },
      { name: "cotizacion", description: "Gestion de cotizaciones y leads" },
      { name: "lead", description: "Gestion de leads" },
      { name: "equipo", description: "Gestion de equipos" },
      { name: "pedido", description: "Gestion de pedidos" },
      { name: "contrato", description: "Gestion de contratos" },
      { name: "voucher", description: "Gestion de voucher" },
      { name: "pagos", description: "Gestion de pagos" },
    ],
    components: {
      securitySchemes: {
        BearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: [
    "src/routes/auth.js",
    "src/modules/cliente/**/*.js",
    "src/modules/empleado/**/*.js",
    "src/modules/servicio/**/*.js",
    "src/modules/evento/**/*.js",
    "src/modules/eventos_servicios/**/*.js",
    "src/modules/cotizacion/**/*.js",
    "src/modules/lead/**/*.js",
    "src/modules/equipo/**/*.js",
    "src/modules/pedido/**/*.js",
    "src/modules/proyecto/**/*.js",
    "src/modules/contrato/**/*.js",
    "src/modules/voucher/**/*.js",
    "src/modules/pagos/**/*.js",
  ],
};