// src/middlewares/error-handler.js
const logger = require("../utils/logger");

module.exports = function errorHandler(err, req, res, next) {
  logger.error(
    {
      method: req.method,
      path: req.originalUrl,
      message: err?.message,
      stack: process.env.NODE_ENV === "production" ? undefined : err?.stack,
    },
    "Unhandled error"
  );

  const status = err?.status || 500;
  res.status(status).json({
    success: false,
    message: err?.message || "Internal Server Error",
  });
};
