const repo = require("./proyecto.repository");

/* Proyecto */
async function listProyecto() {
  return repo.getAllProyecto();
}
async function findProyectoById(id) {
  const data = await repo.getByIdProyecto(id);
  const row = data?.proyecto ?? (Array.isArray(data) ? data[0] : data);
  const recursos = Array.isArray(data?.recursos) ? data.recursos : [];
  if (!row) {
    const err = new Error("Proyecto no encontrado");
    err.status = 404;
    throw err;
  }
  return { ...row, recursos };
}
async function createProyecto(payload) {
  const pedidoId = payload.pedidoId;
  if (!pedidoId) {
    const err = new Error("pedidoId es requerido");
    err.status = 400;
    throw err;
  }

  // Validar que exista pago abonado (>0)
  const pagoInfo = await repo.getPagoInfoByPedido(pedidoId);
  const pagoRow = Array.isArray(pagoInfo) ? pagoInfo[0] : pagoInfo;
  if (!pagoRow || Number(pagoRow.MontoAbonado || 0) <= 0) {
    const err = new Error("Debe registrarse un pago inicial antes de crear el proyecto");
    err.status = 400;
    throw err;
  }

  const result = await repo.postProyecto(payload);
  const first = Array.isArray(result) ? result[0] : result;
  return { status: "Registro exitoso", proyectoId: first?.proyectoId ?? null };
}
async function updateProyecto(id, payload) {
  await repo.putProyectoById(id, payload);
  return { status: "Actualización exitosa", proyectoId: Number(id) };
}
async function deleteProyecto(id) {
  await repo.deleteProyecto(id);
  return { status: "Eliminada" };
}

async function listEstadosProyecto() {
  return repo.listEstadoProyecto();
}

module.exports = {
  listProyecto,
  findProyectoById,
  createProyecto,
  updateProyecto,
  deleteProyecto,
  listEstadosProyecto,
};
