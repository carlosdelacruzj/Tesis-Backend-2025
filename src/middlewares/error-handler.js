// Manejo de errores centralizado (no cambia tu lógica)
module.exports = function errorHandler(err, req, res, next) {
  // Log mínimo, sin nuevas dependencias
  console.error("[ERROR]", {
    method: req.method,
    path: req.originalUrl,
    message: err && err.message,
  });

  const status = err && err.status ? err.status : 500;
  res.status(status).json({
    success: false,
    message: err && err.message ? err.message : "Internal Server Error",
  });
};
