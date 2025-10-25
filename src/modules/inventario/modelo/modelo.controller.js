// src/modules/inventario/modelo/modelo.controller.js
const service = require("./modelo.service");

// GET /inventario/modelos
async function listModelos(_req, res, next) {
  try {
    const data = await service.list();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

// GET /inventario/modelos/:idModelo
async function getModelo(req, res, next) {
  try {
    const data = await service.findById(req.params.idModelo);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

// POST /inventario/modelos
async function createModelo(req, res, next) {
  try {
    const result = await service.create(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

// PUT /inventario/modelos/:idModelo
async function updateModelo(req, res, next) {
  try {
    const result = await service.update(req.params.idModelo, req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

// DELETE /inventario/modelos/:idModelo
async function deleteModelo(req, res, next) {
  try {
    await service.remove(req.params.idModelo);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listModelos,
  getModelo,
  createModelo,
  updateModelo,
  deleteModelo,
};
