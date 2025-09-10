// src/app.js
require("dotenv").config(); // debe ser la PRIMERA línea

const express = require("express");
const app = express();

const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const errorHandler = require("./middlewares/error-handler");
const authMiddleware = require("./middlewares/auth");

const pinoHttp = require("pino-http");
const logger = require("./utils/logger");

const fs = require("fs");
try {
  // Asegura carpeta para uploads (multer)
  fs.mkdirSync("uploads", { recursive: true });
} catch (_) {}

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const pool = require("./db"); // inicializa conexión DB
// CORS desde .env
const origins = (process.env.CORS_ORIGINS || "http://localhost:4200,http://localhost:3000")
  .split(",")
  .map((s) => s.trim());
// Swagger
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "TP-2021",
      description: "Api de TP2021 ",
      contact: { name: "r.k.villanueva.laurente@gmail.com" },
      servers: ["http://localhost:3000"],
    },
  },
  // Busca anotaciones en todos tus routers
  apis: ["src/app.js", "src/routes/*.js"],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-doc", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Puerto
app.set("port", process.env.PORT || 3000);

// Seguridad
app.use(helmet());

// CORS (ajusta origins para tu front)
app.use(
  cors({
    origin: origins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Rate limit desde .env
const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const max = Number(process.env.RATE_LIMIT_MAX || 100);
const limiter = rateLimit({ windowMs, max, standardHeaders: true, legacyHeaders: false });

app.use(limiter);

// Body parser
app.use(express.json({ extended: false }));

// Logs HTTP (cada request)
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { method: req.method, url: req.url };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
    customSuccessMessage(req, res) {
      return `${req.method} ${req.url} → ${res.statusCode}`;
    },
    customErrorMessage(req, res, err) {
      return `ERROR ${req.method} ${req.url} → ${res.statusCode}: ${err.message}`;
    },
  })
);

// Healthcheck público (incluye ping a DB)
app.get("/health", async (_req, res) => {
  const start = Date.now();
  try {
    await pool.query("SELECT 1");
    const ms = Date.now() - start;
    res.json({ status: "ok", db: "up", latency_ms: ms });
  } catch (err) {
    const ms = Date.now() - start;
    res.status(503).json({
      status: "degraded",
      db: "down",
      latency_ms: ms,
      error: err.message,
    });
  }
});

// 👉 Autenticación (JWT) desde aquí hacia abajo
app.use(authMiddleware);

// Rutas
app.use(require("./routes"));

// 404 (si no cayó en ninguna ruta)
app.use((req, res, _next) => {
  res.status(404).json({ success: false, message: "Not Found" });
});

// Manejador de errores (último siempre)
app.use(errorHandler);

// --- Graceful shutdown ---
const httpClose = () =>
  new Promise((resolve) => server.close(resolve)); // cerrar sin cortar requests en vuelo

const stop = async (signal) => {
  logger.info({ signal }, "Shutting down...");
  try {
    // deja de aceptar conexiones nuevas y espera a que terminen las actuales
    await httpClose();
    // cierra pool de DB (mysql2)
    if (pool?.end) await pool.end();
    logger.info("Shutdown complete");
    process.exit(0);
  } catch (err) {
    logger.error({ err }, "Shutdown error");
    process.exit(1);
  }
};

// ÚNICO listen
const server = app.listen(app.get("port"), () => {
  logger.info({ port: app.get("port") }, "Server started");
});

// Señales de sistema
process.on("SIGINT", () => stop("SIGINT"));
process.on("SIGTERM", () => stop("SIGTERM"));

// Reinicio de nodemon: envía SIGUSR2
process.once("SIGUSR2", async () => {
  await stop("SIGUSR2");
  // deja que nodemon continúe con el reinicio
  process.kill(process.pid, "SIGUSR2");
});
