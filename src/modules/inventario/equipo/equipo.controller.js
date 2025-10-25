// src/modules/inventario/equipo/equipo.controller.js
const service = require("./equipo.service");

// GET /inventario/equipos
async function listEquipos(req, res, next) {
  try {
    const filters = {
      idTipoEquipo: req.query.tipo,
      idMarca: req.query.marca,
      idModelo: req.query.modelo,
    };
    const hasFilters = Object.values(filters).some((v) => v != null);
    const data = hasFilters ? await service.listByFilters(filters) : await service.list();
    res.status(200).json(data);
    
  } catch (err) {
    next(err);
  }
}

// GET /inventario/equipos/:idEquipo
async function getEquipo(req, res, next) {
  try {
    const data = await service.findById(req.params.idEquipo);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

// POST /inventario/equipos
async function createEquipo(req, res, next) {
  try {
    const result = await service.create(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

// PUT /inventario/equipos/:idEquipo
async function updateEquipo(req, res, next) {
  try {
    const result = await service.update(req.params.idEquipo, req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

// DELETE /inventario/equipos/:idEquipo
async function deleteEquipo(req, res, next) {
  try {
    await service.remove(req.params.idEquipo);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// GET /inventario/equipos/resumen
async function summarizeEquipos(_req, res, next) {
  try {
    const data = await service.summarize();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

// GET /inventario/equipos/estados
async function listEstadosEquipo(_req, res, next) {
  try {
    const data = await service.listEstados();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

// PATCH /inventario/equipos/:idEquipo/estado
async function updateEstadoEquipo(req, res, next) {
  try {
    const data = await service.updateEstado(req.params.idEquipo, req.body);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listEquipos,
  getEquipo,
  createEquipo,
  updateEquipo,
  deleteEquipo,
  summarizeEquipos,
  listEstadosEquipo,
  updateEstadoEquipo,
};
