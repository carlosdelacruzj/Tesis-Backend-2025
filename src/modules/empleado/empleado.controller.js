// src/modules/empleado/empleado.controller.js
const service = require("./empleado.service");

// GET /empleados
async function getAll(_req, res, next) {
  try {
    const data = await service.list();
    res.status(200).json(data);
  } catch (err) { next(err); }
}

// GET /empleados/lista
async function getList(_req, res, next) {
  try {
    const data = await service.listSimple();
    res.status(200).json(data);
  } catch (err) { next(err); }
}

// GET /empleados/disponibles/:idProyecto
async function getDisponibles(req, res, next) {
  try {
    const data = await service.listDisponibles(req.params.idProyecto);
    res.status(200).json(data);
  } catch (err) { next(err); }
}

// GET /empleados/cargos
async function getCargos(_req, res, next) {
  try {
    const data = await service.listCargos();
    res.status(200).json(data);
  } catch (err) { next(err); }
}

// GET /empleados/:id
async function getById(req, res, next) {
  try {
    const data = await service.findById(req.params.id);
    res.status(200).json(data);
  } catch (err) { next(err); }
}

// POST /empleados
async function create(req, res, next) {
  try {
    const result = await service.create(req.body);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

// PUT /empleados/:id
async function update(req, res, next) {
  try {
    if (req.params?.id != null) req.body = { ...req.body, idEmpleado: req.params.id };
    const result = await service.update(req.body);
    res.status(200).json(result);
  } catch (err) { next(err); }
}

module.exports = {
  getAll,
  getList,
  getDisponibles,
  getCargos,
  getById,
  create,
  update,
};
