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
    const r = await service.updateProyecto(req.params.id, req.body);
    res.status(200).json(r);
  } catch (e) { next(e); }
}
async function deleteProyecto(req, res, next) {
  try {
    const r = await service.deleteProyecto(req.params.id);
    res.status(200).json(r);
  } catch (e) { next(e); }
}
async function getEstados(_req, res, next) {
  try {
    const data = await service.listEstadosProyecto();
    res.status(200).json(data);
  } catch (e) { next(e); }
}

module.exports = {
  getAllProyecto,
  getByIdProyecto,
  postProyecto,
  putProyecto,
  deleteProyecto,
  getEstados,
};
