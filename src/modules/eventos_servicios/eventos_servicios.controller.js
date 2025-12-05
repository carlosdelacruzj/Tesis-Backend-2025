const service = require("./eventos_servicios.service");

// GET /eventos_servicios?evento=&servicio=
async function getAll(req, res, next) {
  try {
    const { evento, servicio } = req.query;
    const data = await service.list({ evento, servicio });
    res.status(200).json(data);
  } catch (err) { next(err); }
}

// GET /eventos_servicios/:id
async function getById(req, res, next) {
  try {
    const data = await service.findById(req.params.id);
    res.status(200).json(data);
  } catch (err) { next(err); }
}

async function getCategorias(req, res, next) {
  try {
    const data = await service.listCategorias();
    res.status(200).json(data);
  } catch (err) { next(err); }
}

async function getEstados(_req, res, next) {
  try {
    const data = await service.listEstados();
    res.status(200).json(data);
  } catch (err) { next(err); }
}

// POST /eventos_servicios
async function create(req, res, next) {
  try {
    const result = await service.create(req.body);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

// PUT /eventos_servicios/:id
async function update(req, res, next) {
  try {
    if (req.params?.id != null) req.body = { ...req.body, id: req.params.id };
    const result = await service.update(req.body);
    res.status(200).json(result);
  } catch (err) { next(err); }
}

async function patchEstado(req, res, next) {
  try {
    const result = await service.updateEstado(req.params.id, req.body);
    res.status(200).json(result);
  } catch (err) { next(err); }
}

module.exports = {
  getAll,
  getById,
  getCategorias,
  getEstados,
  create,
  update,
  patchEstado,
};
