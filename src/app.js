// src/app.js
require("dotenv").config();

const express = require("express");
const app = express();

const fs = require("fs");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const pinoHttp = require("pino-http");

const pool = require("./db");
const logger = require("./utils/logger");
const authMiddleware = require("./middlewares/auth");
const errorHandler = require("./middlewares/error-handler");
const basicAuth = require("./middlewares/basic-auth");

// Swagger
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const swaggerConfig = require("./config/swagger");
const swaggerDocs = swaggerJsDoc(swaggerConfig);
const swaggerUiOpts = {
  swaggerOptions: { docExpansion: "none", tagsSorter: "alpha", operationsSorter: "alpha" },
};

// uploads/
try { fs.mkdirSync("uploads", { recursive: true }); } catch (_) {}

app.set("port", process.env.PORT || 3000);

// Seguridad y CORS
app.use(helmet());
const origins = (process.env.CORS_ORIGINS || "http://localhost:4200,http://localhost:3000")
  .split(",")
  .map((s) => s.trim());
app.use(cors({
  origin: origins,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true,
}));

// Rate limit (excluye health y swagger)
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.RATE_LIMIT_MAX || 100),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/health" || req.path.startsWith("/api-doc") || req.path === "/api-doc.json",
});
app.use(limiter);

// Body parsers + logs
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp({
  logger,
  serializers: {
    req(req) { return { method: req.method, url: req.url }; },
    res(res) { return { statusCode: res.statusCode }; },
  },
  customSuccessMessage(req, res) { return `${req.method} ${req.url} → ${res.statusCode}`; },
  customErrorMessage(req, res, err) { return `ERROR ${req.method} ${req.url} → ${res.statusCode}: ${err.message}`; },
}));

// Healthcheck
app.get("/health", async (_req, res) => {
  const start = Date.now();
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "up", latency_ms: Date.now() - start });
  } catch (err) {
    res.status(503).json({ status: "degraded", db: "down", latency_ms: Date.now() - start, error: err.message });
  }
});

// Swagger UI / JSON (público en dev, basic-auth en prod)
const swaggerUser = process.env.SWAGGER_USER || "admin";
const swaggerPass = process.env.SWAGGER_PASS || "admin123";
if (process.env.NODE_ENV === "production") {
  app.get("/api-doc.json", basicAuth(swaggerUser, swaggerPass), (_req, res) => res.json(swaggerDocs));
  app.use("/api-doc", basicAuth(swaggerUser, swaggerPass), swaggerUi.serve, swaggerUi.setup(swaggerDocs, swaggerUiOpts));
} else {
  app.get("/api-doc.json", (_req, res) => res.json(swaggerDocs));
  app.use("/api-doc", swaggerUi.serve, swaggerUi.setup(swaggerDocs, swaggerUiOpts));
}

// Auth pública (login dev)
app.use("/api/v1/auth", require("./routes/auth"));

// ✅ Rutas protegidas (desactivables en DEV)
//    - En producción: SIEMPRE activo
//    - En desarrollo: usa DEV_REQUIRE_AUTH="true" para activarlo; por defecto desactivado
const requireAuth = process.env.NODE_ENV === "production" || process.env.DEV_REQUIRE_AUTH === "true";
if (requireAuth) {
  app.use(authMiddleware);
  logger.info("🔒 Auth middleware ACTIVO");
} else {
  logger.warn("⚠️ Auth middleware DESACTIVADO (DEV)");
}

// API principal
app.use("/api/v1", require("./routes"));

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Not Found" });
});

// Errores
app.use(errorHandler);

// Graceful shutdown
const httpClose = () => new Promise((resolve) => server.close(resolve));
const stop = async (signal) => {
  logger.info({ signal }, "Shutting down...");
  try {
    await httpClose();
    if (pool?.end) await pool.end();
    logger.info("Shutdown complete");
    process.exit(0);
  } catch (err) {
    logger.error({ err }, "Shutdown error");
    process.exit(1);
  }
};

const server = app.listen(app.get("port"), () => {
  logger.info({ port: app.get("port") }, "Server started");
});

process.on("SIGINT", () => stop("SIGINT"));
process.on("SIGTERM", () => stop("SIGTERM"));
process.once("SIGUSR2", async () => { await stop("SIGUSR2"); process.kill(process.pid, "SIGUSR2"); });
