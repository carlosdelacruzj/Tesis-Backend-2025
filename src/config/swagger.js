// src/config/swagger.js
module.exports = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Tesis 2025",
      version: "1.0.0",
      description: "API para la gestión de la tesis 2025",
      contact: {
        name: "delacruzcarlos1405@gmail.com",
      },
    },
    servers: [
      { url: "/api/v1" }, // 👈 importante para que Swagger apunte a /api/v1
    ],
    tags: [
      { name: "auth", description: "Autenticación (desarrollo)" },
      { name: "cliente", description: "Gestión de clientes" },
      { name: "empleado", description: "Gestión de empleados" },
      { name: "servicio", description: "Servicios disponibles" },
      { name: "evento", description: "Gestión de eventos" },
      { name: "eventos_servicios", description: "Relación eventos/servicios" },
    ],
    components: {
      securitySchemes: {
        BearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    security: [{ BearerAuth: [] }], // por defecto todos los paths requieren JWT
  },
  apis: [
    "src/routes/auth.js",
    "src/modules/cliente/**/*.js",
    "src/modules/empleado/**/*.js",
    "src/modules/servicio/**/*.js",
    "src/modules/evento/**/*.js",
    "src/modules/eventos_servicios/**/*.js",
  ],
};

// module.exports = {
//   definition: {
//     openapi: "3.0.0",
//     info: {
//       title: "Tesis 2025",           // 👈 nuevo nombre
//       version: "1.0.0",
//       description: "API para la gestión de la tesis 2025",
//       contact: {
//         name: "delacruzcarlos1405@gmail.com",
//       },
//     },
//     tags: [
//       { name: "core", description: "Autenticación y utilidades básicas" },
//       { name: "proyecto", description: "Gestión de proyectos y asignaciones" },
//       { name: "empleado", description: "Gestión de empleado" },
//       { name: "equipo", description: "Gestión de equipos" },
//       { name: "pedido", description: "Gestión de pedidos" },
//       { name: "eventos", description: "Gestión de eventos" },
//       { name: "eventos_servicios", description: "Relación eventos/servicios" },
//       { name: "cliente", description: "Gestión de clientes" },
//       { name: "servicio", description: "Servicios disponibles" },
//       { name: "contrato", description: "Contratos asociados a pedidos" },
//       { name: "mobile", description: "Endpoints para la app móvil" },
//       { name: "voucher", description: "Gestión de vouchers/pagos" },
//       { name: "usuario", description: "Usuarios del sistema" },
//       { name: "equiposAlquilado", description: "Equipos alquilados" },
//       { name: "dashboard", description: "Reportes y estadísticas" },
//       { name: "perfiles", description: "Roles y permisos" },
//       { name: "utils", description: "Correo, Drive, etc." },
//     ],

//   },
//     apis: ["src/routes/**/*.js", "src/modules/**/*.js"], // 👈 añade modules
// };
