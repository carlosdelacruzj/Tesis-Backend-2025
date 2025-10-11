// src/app.js
require("dotenv").config();

const fs = require("fs");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const pinoHttp = require("pino-http");

const app = express();

const pool = require("./db");
const logger = require("./utils/logger");
const authMiddleware = require("./middlewares/auth");
const errorHandler = require("./middlewares/error-handler");
const basicAuth = require("./middlewares/basic-auth");

// ───────────────────────── Bootstrap ───────────────────────
try { fs.mkdirSync("uploads", { recursive: true }); } catch (_) {}

const PORT = Number(process.env.PORT || 3000);
app.set("port", PORT);

// ───────────────────────── Seguridad / CORS ────────────────
app.use(helmet({ contentSecurityPolicy: false }));

const origins = (process.env.CORS_ORIGINS || "http://localhost:4200")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: origins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
  credentials: true,
}));

// ───────────────────────── Parsers / Logs ──────────────────
app.use(express.json({ limit: "10mb" }));
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

// ───────────────────────── Rate limit ──────────────────────
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.RATE_LIMIT_MAX || 100),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) =>
    req.path === "/health" ||
    req.path === "/" ||
    req.path.startsWith("/api-doc") ||
    req.path === "/api-doc.json",
});
app.use(limiter);

// ───────────────────────── Health / Root ───────────────────
app.get("/", (_req, res) => res.status(200).send("OK"));

app.get("/health", async (_req, res) => {
  const start = Date.now();
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "up", latency_ms: Date.now() - start });
  } catch (err) {
    res.status(503).json({
      status: "degraded",
      db: "down",
      latency_ms: Date.now() - start,
      error: err.message,
    });
  }
});

app.get("/api/ping-root", (_req, res) => res.json({ ok: true, from: "app.js" }));

// ───────────────────────── Swagger (opcional) ──────────────
(() => {
  try {
    const swaggerJsDoc = require("swagger-jsdoc");
    const swaggerUi = require("swagger-ui-express");
    const swaggerConfig = require("./config/swagger");

    const swaggerDocs = swaggerJsDoc(swaggerConfig);
    const swaggerUiOpts = {
      swaggerOptions: { docExpansion: "none", tagsSorter: "alpha", operationsSorter: "alpha" },
    };

    const swaggerUser = process.env.SWAGGER_USER || "admin";
    const swaggerPass = process.env.SWAGGER_PASS || "admin123";

    if ((process.env.NODE_ENV || "").toLowerCase() === "production") {
      app.get("/api-doc.json", basicAuth(swaggerUser, swaggerPass), (_req, res) => res.json(swaggerDocs));
      app.use("/api-doc", basicAuth(swaggerUser, swaggerPass), swaggerUi.serve, swaggerUi.setup(swaggerDocs, swaggerUiOpts));
    } else {
      app.get("/api-doc.json", (_req, res) => res.json(swaggerDocs));
      app.use("/api-doc", swaggerUi.serve, swaggerUi.setup(swaggerDocs, swaggerUiOpts));
    }

    logger.info("[swagger] habilitado");
  } catch (e) {
    logger.warn(`[swagger] deshabilitado: ${e.message}`);
  }
})();

// ───────────────────────── Rutas públicas ──────────────────
app.use("/api/v1/auth", require("./routes/auth"));  // login moderno/legacy

// ───────────────────────── Rutas protegidas ────────────────
const requireAuth = (process.env.REQUIRE_AUTH || "").toLowerCase() === "true";
if (requireAuth) {
  app.use(authMiddleware);
  logger.info("🔒 Auth middleware ACTIVO");
} else {
  logger.warn("⚠️ Auth middleware DESACTIVADO (DEV)");
}

// API principal versionada
app.use("/api/v1", require("./routes"));

// ───────────────────────── 404 & errores ───────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Not Found" });
});

app.use(errorHandler);

// ───────────────────────── Arranque & shutdown ─────────────
const server = app.listen(app.get("port"), "0.0.0.0", () => {
  logger.info({ port: app.get("port") }, "Server started");
});

async function httpClose() {
  return new Promise((resolve) => server.close(resolve));
}
async function stop(signal) {
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
}

process.on("SIGINT", () => stop("SIGINT"));
process.on("SIGTERM", () => stop("SIGTERM"));
process.once("SIGUSR2", async () => { await stop("SIGUSR2"); process.kill(process.pid, "SIGUSR2"); });

module.exports = app;
