const repo = require("./contrato.repository");

function assertPedidoId(v) {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) {
    const e = new Error("pedido inválido");
    e.status = 400;
    throw e;
  }
  return n;
}

async function list() {
  return repo.getAll();
}

async function listByPedido(pedido) {
  const id = assertPedidoId(pedido);
  const data = await repo.getAllByPedido(id);
  if (!data || data.length === 0) {
    const e = new Error(`No hay contratos para el pedido ${id}`);
    e.status = 404;
    throw e;
  }
  return data;
}

module.exports = { list, listByPedido };
