// src/modules/pedido/pedido.service.js
const repo = require("./pedido.repository");

function assertRequired(value, fieldName) {
  if (value === null || value === undefined || String(value).trim() === '') {
    const err = new Error(`El campo '${fieldName}' es requerido`);
    err.status = 400; // Bad Request
    throw err;
  }
}

function assertPositiveNumber(value, fieldName) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) {
    const err = new Error(`El campo '${fieldName}' debe ser un número positivo`);
    err.status = 400;
    throw err;
  }
  return num;
}

async function listAllPedidos() {
  return repo.getAll();
}

async function listIndexPedidos() {
  return repo.getIndex();
}

async function findPedidoById(id) {
  const numericId = assertPositiveNumber(id, "id");
  const pedido = await repo.getById(numericId);

  if (!pedido) {
    const err = new Error(`Pedido con id ${numericId} no encontrado`);
    err.status = 404; // Not Found
    throw err;
  }

  return pedido;
}

async function findLastEstadoPedido() {
  return repo.getLastEstado();
}

async function createNewPedido(payload) {
  const requiredFields = ["ExS", "doc", "fechaCreate", "fechaEvent", "horaEvent", "CodEmp", "Direccion"];
  requiredFields.forEach(field => assertRequired(payload[field], field));

  const result = await repo.create(payload);
  return { status: "Registro exitoso", ...result };
}

async function updatePedidoById(payload) {
  const requiredFields = ["id", "estadoPedido", "fechaEvent", "horaEvent", "lugar", "empleado", "estadoPago"];
  requiredFields.forEach(field => assertRequired(payload[field], field));
  
  assertPositiveNumber(payload.id, "id");
  assertPositiveNumber(payload.estadoPedido, "estadoPedido");
  assertPositiveNumber(payload.empleado, "empleado");
  assertPositiveNumber(payload.estadoPago, "estadoPago");

  const result = await repo.updateById(payload);
  return { status: "Actualización exitosa", ...result };
}

module.exports = {
  listAllPedidos,
  listIndexPedidos,
  findPedidoById,
  findLastEstadoPedido,
  createNewPedido,
  updatePedidoById,
};