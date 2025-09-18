const repo = require("./voucher.repository");

function assertIdPositivo(val, nombre = "id") {
  const n = Number(val);
  if (!Number.isFinite(n) || n <= 0) {
    const e = new Error(`${nombre} inválido`);
    e.status = 400;
    throw e;
  }
  return n;
}
function assertNumber(val, nombre) {
  const n = Number(val);
  if (!Number.isFinite(n)) {
    const e = new Error(`${nombre} debe ser numérico`);
    e.status = 400;
    throw e;
  }
  return n;
}

async function listPedidosByEstado(idEstado) {
  const id = assertIdPositivo(idEstado, "idEstado");
  return repo.getPedidosByEstado(id);
}

async function listByPedido(idPedido) {
  const id = assertIdPositivo(idPedido, "idPedido");
  return repo.getAllByPedido(id);
}

async function getByPedido(idPedido) {
  const id = assertIdPositivo(idPedido, "idPedido");
  const data = await repo.getByPedido(id);
  if (!data || data.length === 0) {
    const e = new Error(`No hay voucher para el pedido ${id}`);
    e.status = 404;
    throw e;
  }
  return data;
}

async function listMetodosPago() {
  return repo.getMetodosPago();
}

async function listEstados() {
  return repo.getEstados();
}

async function create(payload) {
  const required = ["monto", "metodoPago", "estadoVoucher", "idPedido"];
  for (const f of required) {
    if (payload[f] == null || payload[f] === "") {
      const e = new Error(`Campo '${f}' es requerido`);
      e.status = 400;
      throw e;
    }
  }

  assertNumber(payload.monto, "monto");
  assertIdPositivo(payload.metodoPago, "metodoPago");
  assertIdPositivo(payload.estadoVoucher, "estadoVoucher");
  assertIdPositivo(payload.idPedido, "idPedido");

  await repo.create(payload);
  return { Status: "Registro exitoso" };
}
module.exports = {
  listPedidosByEstado,
  listByPedido,
  getByPedido,
  listMetodosPago,
  listEstados,
  create,
};
