const repo = require("./pedido.repository");

function assertRequired(v, f){ if(v==null || String(v).trim()===""){ const e=new Error(`El campo '${f}' es requerido`); e.status=400; throw e; } }
function assertPositiveNumber(v,f){ const n=Number(v); if(!Number.isFinite(n)||n<=0){ const e=new Error(`El campo '${f}' debe ser un número positivo`); e.status=400; throw e; } return n; }

async function listAllPedidos(){ return repo.getAll(); }
async function listIndexPedidos(){ return repo.getIndex(); }

async function findPedidoById(id){
  const n = assertPositiveNumber(id,"id");
  const p = await repo.getById(n);
  if(!p){ const e = new Error(`Pedido con id ${n} no encontrado`); e.status=404; throw e; }
  return p;
}

async function findLastEstadoPedido(){ return repo.getLastEstado(); }

async function createNewPedido(payload){
  ["ExS","doc","fechaCreate","fechaEvent","horaEvent","CodEmp","Direccion"].forEach(f=>assertRequired(payload[f],f));
  const result = await repo.create(payload);
  return { status: "Registro exitoso", ...result };
}

async function updatePedidoById(payload){
  ["id","estadoPedido","fechaEvent","horaEvent","lugar","empleado","estadoPago"].forEach(f=>assertRequired(payload[f],f));
  assertPositiveNumber(payload.id,"id");
  assertPositiveNumber(payload.estadoPedido,"estadoPedido");
  assertPositiveNumber(payload.empleado,"empleado");
  assertPositiveNumber(payload.estadoPago,"estadoPago");
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
