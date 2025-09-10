// src/app.js
require("dotenv").config(); // debe ser la PRIMERA línea

const express = require("express");
const app = express();

const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const errorHandler = require("./middlewares/error-handler");
const authMiddleware = require("./middlewares/auth"); // 🔑 import del middleware de auth

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const pool = require("./db"); // index.js por convención

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
  apis: ["src/app.js", "src/routes/core.js", "src/routes/proyecto.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-doc", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

//settings
app.set("port", process.env.PORT || 3000);

// Middlewares de seguridad
app.use(helmet()); // protege cabeceras HTTP

app.use(
  cors({
    origin: ["http://localhost:4200", "http://localhost:3000"], // ajusta al front que uses
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // máximo 100 requests/IP/ventana
  standardHeaders: true, // devuelve info en cabeceras RateLimit
  legacyHeaders: false, // desactiva X-RateLimit obsoletas
});
app.use(limiter);

// Body parser
app.use(express.json({ extended: false }));

// Healthcheck público
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// 👉 tu lógica de auth se aplica aquí
app.use(authMiddleware);

// Routes
app.use(require("./routes/core"));
app.use(require("./routes/proyecto"));

// 404 (si no cayó en ninguna ruta)
app.use((req, res, _next) => {
  res.status(404).json({ success: false, message: "Not Found" });
});

// Manejador de errores (último siempre)
app.use(errorHandler);

// Start server
app.listen(app.get("port"), () => {
  console.log("Server on port", app.get("port"));
});
