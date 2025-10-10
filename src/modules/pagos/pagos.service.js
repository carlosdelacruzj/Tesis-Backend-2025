const repo = require("./pagos.repository");

function badRequest(msg) {
  const e = new Error(msg);
  e.status = 400;
  return e;
}
function assertIdPositivo(val, nombre = "id") {
  const n = Number(val);
  if (!Number.isFinite(n) || n <= 0) throw badRequest(`${nombre} inválido`);
  return n;
}
function assertNumber(val, nombre) {
  const n = Number(val);
  if (!Number.isFinite(n)) throw badRequest(`${nombre} debe ser numérico`);
  return n;
}

async function listPendientes() {
  return repo.listPendientes();
}
async function listParciales() {
  return repo.listParciales();
}
async function listPagados() {
  return repo.listPagados();
}

async function getResumen(pedidoId) {
  const id = assertIdPositivo(pedidoId, "pedidoId");
  const rows = await repo.getResumenByPedido(id);
  // El SP retorna 1 fila; si no, devolvemos ceros para no romper el front
  return rows?.[0] ?? { CostoTotal: 0, MontoAbonado: 0, SaldoPendiente: 0 };
}

async function listVouchers(pedidoId) {
  const id = assertIdPositivo(pedidoId, "pedidoId");
  return repo.listVouchersByPedido(id);
}

async function listMetodos() {
  return repo.listMetodos();
}

async function createVoucher({
  file, // <-- ahora opcional
  pedidoId,
  monto,
  metodoPagoId,
  estadoVoucherId = 2, // default Aprobado
  fecha,
}) {
  const id = assertIdPositivo(pedidoId, "pedidoId");
  assertNumber(monto, "monto");
  const mp = assertIdPositivo(metodoPagoId, "metodoPagoId");
  const ev = assertIdPositivo(estadoVoucherId, "estadoVoucherId");

  // Si no hay archivo, persistimos nulos en columnas de imagen
  const imagen = file?.buffer ?? null;
  const mime = file?.mimetype ?? null;
  const nombre = file?.originalname ?? null;
  const size = file?.size ?? null;

  await repo.insertVoucher({
    monto: Number(monto),
    metodoPagoId: Number(metodoPagoId),
    estadoVoucherId: Number(estadoVoucherId),
    imagen, // Buffer o null
    pedidoId: Number(pedidoId),
    fecha: fecha || new Date(),
    mime, // string o null
    nombre, // string o null
    size, // number o null
  });

  return { Status: "Voucher registrado" };
}

async function getVoucherImage(id) {
  const row = await repo.getVoucherById(Number(id));
  if (!row || !row.Pa_Imagen_Voucher) return null;
  return row;
}

module.exports = {
  listPendientes,
  listParciales,
  listPagados,
  getResumen,
  listVouchers,
  listMetodos,
  createVoucher,
  getVoucherImage,
};
