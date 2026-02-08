const service = require("./proyecto.service");

/* Proyecto */
async function getAllProyecto(_req, res, next) {
  try {
    const data = await service.listProyecto();
    res.status(200).json(data);
  } catch (e) {
    next(e);
  }
}
async function getByIdProyecto(req, res, next) {
  try {
    const data = await service.findProyectoById(req.params.id);
    res.status(200).json(data);
  } catch (e) {
    next(e);
  }
}
async function postProyecto(req, res, next) {
  try {
    const r = await service.createProyecto(req.body);
    res.status(201).json(r);
  } catch (e) {
    next(e);
  }
}
async function putProyecto(req, res, next) {
  try {
    const r = await service.updateProyecto(req.params.id, req.body);
    res.status(200).json(r);
  } catch (e) {
    next(e);
  }
}
async function deleteProyecto(req, res, next) {
  try {
    const r = await service.deleteProyecto(req.params.id);
    res.status(200).json(r);
  } catch (e) {
    next(e);
  }
}
async function patchProyecto(req, res, next) {
  try {
    const r = await service.patchProyecto(req.params.id, req.body);
    res.status(200).json(r);
  } catch (e) {
    next(e);
  }
}
async function patchProyectoPostproduccion(req, res, next) {
  try {
    const r = await service.patchProyectoPostproduccion(req.params.id, req.body);
    res.status(200).json(r);
  } catch (e) {
    next(e);
  }
}
async function getEstados(_req, res, next) {
  try {
    const data = await service.listEstadosProyecto();
    res.status(200).json(data);
  } catch (e) {
    next(e);
  }
}

async function getEstadosDia(_req, res, next) {
  try {
    const data = await service.listEstadosProyectoDia();
    res.status(200).json(data);
  } catch (e) {
    next(e);
  }
}

async function patchProyectoDiaEstado(req, res, next) {
  try {
    const { diaId } = req.params;
    const { estadoDiaId } = req.body || {};
    const r = await service.updateProyectoDiaEstado(diaId, estadoDiaId);
    res.status(200).json(r);
  } catch (e) {
    next(e);
  }
}

async function getDisponibilidadAsignaciones(req, res, next) {
  try {
    const data = await service.disponibilidadAsignaciones(req.query);
    res.status(200).json(data);
  } catch (e) {
    next(e);
  }
}

async function postProyectoAsignacionesUpsert(req, res, next) {
  try {
    const r = await service.upsertProyectoAsignaciones(req.body);
    res.status(200).json(r);
  } catch (e) {
    next(e);
  }
}

async function postProyectoDiaIncidencia(req, res, next) {
  try {
    const { diaId } = req.params;
    const r = await service.createProyectoDiaIncidencia(diaId, req.body);
    res.status(201).json(r);
  } catch (e) {
    next(e);
  }
}

async function postProyectoDiaDevolucion(req, res, next) {
  try {
    const { diaId } = req.params;
    const r = await service.devolverEquiposDia(diaId, req.body);
    res.status(200).json(r);
  } catch (e) {
    next(e);
  }
}

async function postProyectoDiaDevolucionAsync(req, res, next) {
  try {
    const { diaId } = req.params;
    const r = await service.enqueueDevolucionEquiposDia(diaId, req.body);
    res.status(202).json(r);
  } catch (e) {
    next(e);
  }
}

async function patchProyectoDiaEquipoDevolucion(req, res, next) {
  try {
    const { diaId, equipoId } = req.params;
    const r = await service.devolverEquipo(diaId, equipoId, req.body);
    res.status(200).json(r);
  } catch (e) {
    next(e);
  }
}

async function postProyectoEquipoDevolucionPreview(req, res, next) {
  try {
    const r = await service.previewDevolucionEquipo(req.body);
    res.status(200).json(r);
  } catch (e) {
    next(e);
  }
}

async function getProyectoDevolucionJob(req, res, next) {
  try {
    const { jobId } = req.params;
    const r = await service.getDevolucionJobStatus(jobId);
    res.status(200).json(r);
  } catch (e) {
    next(e);
  }
}

module.exports = {
  getAllProyecto,
  getByIdProyecto,
  postProyecto,
  putProyecto,
  deleteProyecto,
  patchProyecto,
  patchProyectoPostproduccion,
  getEstados,
  getEstadosDia,
  patchProyectoDiaEstado,
  getDisponibilidadAsignaciones,
  postProyectoAsignacionesUpsert,
  postProyectoDiaIncidencia,
  postProyectoDiaDevolucion,
  postProyectoDiaDevolucionAsync,
  patchProyectoDiaEquipoDevolucion,
  postProyectoEquipoDevolucionPreview,
  getProyectoDevolucionJob,
};
