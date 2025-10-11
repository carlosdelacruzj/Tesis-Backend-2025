// cotizacion.controller.js
const logger = require("../../utils/logger");
const service = require("./cotizacion.service");

async function getAll(req, res, next) {
  try {
    const data = await service.list({ estado: req.query?.estado });
    res.status(200).json(data);
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const data = await service.findById(req.params.id);
    res.status(200).json(data);
  } catch (err) { next(err); }
}

async function downloadPdf(req, res, next) {
  logger.info(
    {
      module: "cotizacion",
      action: "downloadPdf",
      id: req.params.id,
    },
    "Solicitud de PDF recibida"
  );
  try {
    await service.streamPdf({
      id: req.params.id,
      res,
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

// POST /cotizaciones/public
async function createPublic(req, res, next) {
  try {
    const result = await service.createPublic(req.body);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

// POST /cotizaciones/admin
async function createAdmin(req, res, next) {
  try {
    const result = await service.createAdmin(req.body);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const result = await service.update(req.params.id, req.body);
    res.status(200).json(result);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const result = await service.remove(req.params.id);
    res.status(200).json(result);
  } catch (err) { next(err); }
}
// cotizacion.controller.js
async function updateEstado(req, res, next) {
  try {
    const { estadoNuevo, estadoEsperado } = req.body || {};
    const data = await service.cambiarEstadoOptimista(req.params.id, { estadoNuevo, estadoEsperado });
    res.status(200).json(data);
  } catch (err) { next(err); }
}

module.exports = {
  getAll,
  getById,
  downloadPdf,
  createPublic,
  createAdmin,
  update,
  remove,
  updateEstado
};
