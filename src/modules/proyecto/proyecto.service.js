const repo = require("./proyecto.repository");

/* Proyecto */
async function listProyecto() { return repo.getAllProyecto(); }
async function findProyectoById(id) {
  return repo.getByIdProyecto(id);
}
async function createProyecto(payload) {
  await repo.postProyecto(payload);
  return { Status: "Registro exitoso" };
}
async function updateProyecto(payload) {
  await repo.putProyectoById(payload);
  return { Status: "Actualización exitosa" };
}
async function deleteProyecto(id) {
  await repo.deleteProyecto(id);
  return { Status: "Eliminada" };
}

module.exports = {
  listProyecto,
  findProyectoById,
  createProyecto,
  updateProyecto,
  deleteProyecto,
};
