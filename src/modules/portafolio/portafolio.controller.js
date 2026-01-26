// src/modules/portafolio/portafolio.controller.js
const service = require("./portafolio.service");

async function getEventos(req, res, next) {
  try {
    const data = await service.listEventos();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function patchEventoMostrar(req, res, next) {
  try {
    const out = await service.updateEventoMostrar(req.params.id, req.body?.mostrar);
    res.json(out);
  } catch (err) {
    next(err);
  }
}

async function getImagenes(req, res, next) {
  try {
    const data = await service.listImagenes({ eventoId: req.query.eventoId });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getPublico(req, res, next) {
  try {
    const data = await service.listPublico();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function postImagenesLote(req, res, next) {
  try {
    const out = await service.createImagenesLote(req.body || {}, req.files || []);
    res.status(201).json(out);
  } catch (err) {
    next(err);
  }
}

async function putImagen(req, res, next) {
  try {
    const out = await service.updateImagen(req.params.id, req.body || {}, req.file);
    res.json(out);
  } catch (err) {
    next(err);
  }
}

async function deleteImagen(req, res, next) {
  try {
    const out = await service.deleteImagen(req.params.id);
    res.json(out);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getEventos,
  patchEventoMostrar,
  getImagenes,
  getPublico,
  postImagenesLote,
  putImagen,
  deleteImagen,
};
