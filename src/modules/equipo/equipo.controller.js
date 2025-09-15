// src/modules/equipo/equipo.controller.js
const service = require("./equipo.service");

// GET /equipo
async function getAllEquipo(_req, res, next) {
  try {
    const data = await service.list();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

// GET /equipo/by-tipo/:idTipoEquipo
async function getByTipoEquipo(req, res, next) {
  try {
    const data = await service.findByTipo(req.params.idTipoEquipo);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

// GET /equipo/by-grupo/:tipoEquipo/:marca/:modelo
async function getAllEquiposByIdGroup(req, res, next) {
  try {
    const { tipoEquipo, marca, modelo } = req.params;
    const data = await service.findByGroup({ tipoEquipo, marca, modelo });
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

// GET /equipo/grupos
async function getAllEquiposGroup(_req, res, next) {
  try {
    const data = await service.listGroup();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

// GET /equipo/marcas
async function getAllMarca(_req, res, next) {
  try {
    const data = await service.listMarca();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

// GET /equipo/modelos/:marca/:tipo
async function getAllModelo(req, res, next) {
  try {
    const { marca, tipo } = req.params;
    const data = await service.listModelo({ marca, tipo });
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

// POST /equipo
async function postEquipo(req, res, next) {
  try {
    const result = await service.create(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

// PUT /equipo/:idEquipo/estado
async function putEstadoEquipo(req, res, next) {
  try {
    const result = await service.updateEstado({
      idEquipo: req.params.idEquipo,
      estado: req.body?.estado,   // <-- viene en el body
    });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

// GET /equipo/contadores/:idModelo
async function getAllContadoresEquiposEstado(req, res, next) {
  try {
    const data = await service.contadoresByModelo(req.params.idModelo);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

// GET /equipo/existe/:numSerie
async function getExistEquipo(req, res, next) {
  try {
    const data = await service.existsBySerie(req.params.numSerie);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllEquipo,
  getByTipoEquipo,
  getAllEquiposByIdGroup,
  getAllEquiposGroup,
  getAllMarca,
  getAllModelo,
  postEquipo,
  putEstadoEquipo,
  getAllContadoresEquiposEstado,
  getExistEquipo,
};