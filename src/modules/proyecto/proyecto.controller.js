const service = require("./proyecto.service");

/* Proyecto */
async function getAllProyecto(_req, res, next) {
  try {
    const data = await service.listProyecto();
    res.status(200).json(data);
  } catch (e) { next(e); }
}
async function getByIdProyecto(req, res, next) {
  try {
    const data = await service.findProyectoById(req.params.id);
    res.status(200).json(data);
  } catch (e) { next(e); }
}
async function postProyecto(req, res, next) {
  try {
    const r = await service.createProyecto(req.body);
    res.status(201).json(r);
  } catch (e) { next(e); }
}
async function putProyecto(req, res, next) {
  try {
    const r = await service.updateProyecto(req.body);
    res.status(200).json(r);
  } catch (e) { next(e); }
}

/* Pedidos */
async function getAllPedidosContratado(_req, res, next) {
  try {
    const data = await service.listPedidosContratado();
    res.status(200).json(data);
  } catch (e) { next(e); }
}

/* Asignaciones de equipos */
async function getAsignaciones(_req, res, next) {
  try {
    const data = await service.listAsignaciones(); // ✅ SIN parámetros
    res.status(200).json(data);
  } catch (e) { next(e); }
}
async function getAsignacionesByProyecto(req, res, next) {
  try {
    const data = await service.listAsignacionesByProyecto(req.params.id);
    res.status(200).json(data);
  } catch (e) { next(e); }
}
async function postAsignacion(req, res, next) {
  try {
    const r = await service.createAsignacion(req.body);
    res.status(201).json(r);
  } catch (e) { next(e); }
}
async function putAsignacion(req, res, next) {
  try {
    const r = await service.updateAsignacion(req.body);
    res.status(200).json(r);
  } catch (e) { next(e); }
}
async function deleteAsignacion(req, res, next) {
  try {
    const r = await service.deleteAsignacion(req.params.id);
    res.status(200).json(r);
  } catch (e) { next(e); }
}

/* Util */
async function getEquiposFiltrados(req, res, next) {
  try {
    const data = await service.listEquiposFiltrados(req.query);
    res.status(200).json(data);
  } catch (e) { next(e); }
}
async function getEventosByProyecto(req, res, next) {
  try {
    const data = await service.listEventosByProyecto(req.params.id);
    res.status(200).json(data);
  } catch (e) { next(e); }
}

module.exports = {
  getAllProyecto,
  getByIdProyecto,
  postProyecto,
  putProyecto,
  getAllPedidosContratado,
  getAsignaciones,
  getAsignacionesByProyecto,
  postAsignacion,
  putAsignacion,
  deleteAsignacion,
  getEquiposFiltrados,
  getEventosByProyecto,
};
