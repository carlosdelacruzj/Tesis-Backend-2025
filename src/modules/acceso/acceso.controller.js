const service = require("./acceso.service");

async function getPerfiles(_req, res, next) {
  try {
    const data = await service.listPerfiles();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

async function postPerfil(req, res, next) {
  try {
    const data = await service.createPerfil(req.body || {});
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

async function putPerfil(req, res, next) {
  try {
    const data = await service.updatePerfil(req.params.perfilCodigo, req.body || {});
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

async function patchPerfilEstado(req, res, next) {
  try {
    const data = await service.setPerfilEstado(req.params.perfilCodigo, req.body || {});
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

async function getPerfilesUsuario(req, res, next) {
  try {
    const data = await service.listPerfilesUsuario(req.params.usuarioId);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

async function postAsignarPerfilUsuario(req, res, next) {
  try {
    const data = await service.assignPerfilUsuario(req.params.usuarioId, req.body || {});
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

async function deletePerfilUsuario(req, res, next) {
  try {
    const data = await service.removePerfilUsuario(
      req.params.usuarioId,
      req.params.perfilCodigo
    );
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPerfiles,
  postPerfil,
  putPerfil,
  patchPerfilEstado,
  getPerfilesUsuario,
  postAsignarPerfilUsuario,
  deletePerfilUsuario,
};
