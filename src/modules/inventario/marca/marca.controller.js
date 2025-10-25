// src/modules/inventario/marca/marca.controller.js
const service = require("./marca.service");

// GET /inventario/marcas
async function listMarcas(_req, res, next) {
  try {
    const data = await service.list();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

// GET /inventario/marcas/:idMarca
async function getMarca(req, res, next) {
  try {
    const data = await service.findById(req.params.idMarca);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

// POST /inventario/marcas
async function createMarca(req, res, next) {
  try {
    const result = await service.create(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

// PUT /inventario/marcas/:idMarca
async function updateMarca(req, res, next) {
  try {
    const result = await service.update(req.params.idMarca, req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

// DELETE /inventario/marcas/:idMarca
async function deleteMarca(req, res, next) {
  try {
    await service.remove(req.params.idMarca);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listMarcas,
  getMarca,
  createMarca,
  updateMarca,
  deleteMarca,
};
