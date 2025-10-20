const svc = require("./cotizacion.service");
const logger = require("../../utils/logger");

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

// ⬇️ Generación de PDF (pasa query + body al servicio)
async function downloadPdf(req, res, next) {
  logger.info(
    { module: "cotizacion", action: "downloadPdf", id: req.params.id },
    "Solicitud de PDF recibida"
  );
  try {
    await svc.streamPdf({
      id: req.params.id,
      res,
      body: req.body || {},     // 👈 aquí va el logo/firma/equipo que viene del front
    });
    logger.info(
      { module: "cotizacion", action: "downloadPdf:success", id: req.params.id },
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
  downloadPdf,
  updateEstado,
};
