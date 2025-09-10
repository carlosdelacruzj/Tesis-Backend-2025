// src/utils/logger.js
const pino = require("pino");

// Usa pretty print en dev; JSON en producción
const isProd = process.env.NODE_ENV === "production";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  ...(isProd
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        },
      }),
});

module.exports = logger;
