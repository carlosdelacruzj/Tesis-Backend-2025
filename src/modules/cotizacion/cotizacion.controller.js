const service = require("./cotizacion.service");

async function getAll(req, res, next) {
  try {
    const data = await service.list({ estado: req.query?.estado });
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const data = await service.findById(req.params.id);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const result = await service.create(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const result = await service.update(req.params.id, req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await service.remove(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
