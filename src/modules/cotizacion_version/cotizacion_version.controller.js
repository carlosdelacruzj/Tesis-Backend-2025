const service = require("./cotizacion_version.service");

async function getById(req, res, next) {
  try {
    const data = await service.findById(req.params.versionId);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

async function downloadPdfByVersionId(req, res, next) {
  try {
    await service.streamPdfByVersionId({
      versionId: req.params.versionId,
      res,
      query: req.query || {},
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getById,
  downloadPdfByVersionId,
};
