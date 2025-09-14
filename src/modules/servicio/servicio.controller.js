const service = require("./servicio.service");

// GET /servicios
async function getAll(_req, res, next) {
  try {
    const data = await service.list();
    res.status(200).json(data);
  } catch (err) { next(err); }
}

// GET /servicios/:id
async function getById(req, res, next) {
  try {
    const data = await service.findById(req.params.id);
    res.status(200).json(data);
  } catch (err) { next(err); }
}

// POST /servicios
async function create(req, res, next) {
  try {
    const result = await service.create(req.body);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

// PUT /servicios/:id
async function update(req, res, next) {
  try {
    if (req.params?.id != null) req.body = { ...req.body, idServicio: req.params.id };
    const result = await service.update(req.body);
    res.status(200).json(result);
  } catch (err) { next(err); }
}

module.exports = { getAll, getById, create, update };
