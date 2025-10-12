// src/modules/cotizacion/cotizacion.controller.js
const svc = require("./cotizacion.service");
const logger = require("../../utils/logger");
const service = require("./cotizacion.service");

async function getAll(req, res, next) {
  try {
    const { estado } = req.query || {};
    const data = await svc.list({ estado });
    res.json(data);
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const id = req.params.id;
    const data = await svc.findById(id);
    res.json(data);
  } catch (err) { next(err); }
}

async function createPublic(req, res, next) {
  try {
    const out = await svc.createPublic(req.body || {});
    res.status(201).json(out);
  } catch (err) { next(err); }
}

async function createAdmin(req, res, next) {
  try {
    const out = await svc.createAdmin(req.body || {});
    res.status(201).json(out);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const id = req.params.id;
    const out = await svc.update(id, req.body || {});
    res.json(out);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const id = req.params.id;
    const out = await svc.remove(id);
    res.json(out);
  } catch (err) { next(err); }
}

// ⬇️ IMPORTANTE: este es el que debe llamar a TU streamPdf
async function downloadPdf(req, res, next) {
  logger.info(
    {
      module: "cotizacion",
      action: "downloadPdf",
      id: req.params.id,
      q: req.query, // <-- ver qué query llega
    },
    "Solicitud de PDF recibida"
  );
  try {
    // PASAR QUERY AL SERVICIO  👇
    await service.streamPdf({
      id: req.params.id,
      res,
      mode: req.query.mode,   // <-- NUEVO
      raw: req.query.raw,     // <-- NUEVO
    });
    logger.info(
      {
        module: "cotizacion",
        action: "downloadPdf:success",
        id: req.params.id,
      },
      "PDF generado y enviado"
    );
  } catch (err) {
    logger.error(
      {
        module: "cotizacion",
        action: "downloadPdf:error",
        id: req.params.id,
        message: err.message,
        status: err.status,
      },
      "Error al generar PDF"
    );
    next(err);
  }
}
async function updateEstado(req, res, next) {
  try {
    const { id } = req.params;
    const { estadoNuevo, estadoEsperado } = req.body || {};
    const out = await svc.cambiarEstadoOptimista(id, { estadoNuevo, estadoEsperado });
    res.json(out);
  } catch (err) { next(err); }
}

module.exports = {
  getAll,
  getById,
  createPublic,
  createAdmin,
  update,
  remove,
  downloadPdf,     // 👈 asegúrate que la ruta usa esto
  updateEstado,
};
