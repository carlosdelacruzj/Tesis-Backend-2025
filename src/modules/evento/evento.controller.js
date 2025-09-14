// src/modules/evento/evento.controller.js
const svc = require('./evento.service');

async function getAll(req, res, next) {
  try {
    const data = await svc.findAll();
    res.status(200).json(data); // array
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const data = await svc.findById(req.params.id);
    res.status(200).json(data); // objeto
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const data = await svc.create(req.body);
    res.status(201).json(data); // objeto creado
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const data = await svc.update(req.params.id, req.body);
    res.status(200).json(data); // objeto actualizado
  } catch (err) { next(err); }
}

module.exports = { getAll, getById, create, update };
