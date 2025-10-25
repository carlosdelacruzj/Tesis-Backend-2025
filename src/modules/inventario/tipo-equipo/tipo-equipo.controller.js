// src/modules/inventario/tipo-equipo/tipo-equipo.controller.js
const service = require("./tipo-equipo.service");

// GET /inventario/tipos-equipo
async function listTipos(_req, res, next) {
  try {
    const data = await service.list();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

// GET /inventario/tipos-equipo/:idTipoEquipo
async function getTipo(req, res, next) {
  try {
    const data = await service.findById(req.params.idTipoEquipo);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

// POST /inventario/tipos-equipo
async function createTipo(req, res, next) {
  try {
    const result = await service.create(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

// PUT /inventario/tipos-equipo/:idTipoEquipo
async function updateTipo(req, res, next) {
  try {
    const result = await service.update(req.params.idTipoEquipo, req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

// DELETE /inventario/tipos-equipo/:idTipoEquipo
async function deleteTipo(req, res, next) {
  try {
    await service.remove(req.params.idTipoEquipo);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listTipos,
  getTipo,
  createTipo,
  updateTipo,
  deleteTipo,
};
