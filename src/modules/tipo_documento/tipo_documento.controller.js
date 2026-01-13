const service = require("./tipo_documento.service");

async function getAll(req, res, next) {
  try {
    const data = await service.list();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll };
