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

  let status = err?.status || 500;
  let message = err?.message || "Internal Server Error";

  if (err?.code === "ER_DUP_ENTRY") {
    status = 409;
    const sqlMessage = String(err?.message || "");
    if (sqlMessage.includes("UQ_T_Usuario_Correo")) {
      message = "El correo ya está registrado.";
    } else if (sqlMessage.includes("UQ_T_Usuario_Celular")) {
      message = "El celular ya está registrado.";
    } else if (sqlMessage.includes("UQ_T_Usuario_NumDoc")) {
      message = "El número de documento ya está registrado.";
    } else {
      message = "Registro duplicado.";
    }
  }

  res.status(status).json({ success: false, message });
};
