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
function parseFecha(value, field = "fecha") {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw badRequest(`${field} inválida`);
  return d;
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
async function listAllVouchers() {
  return repo.listAllVouchers();
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
  const fechaNormalizada = parseFecha(fecha);

  await repo.insertVoucher({
    monto: Number(monto),
    metodoPagoId: Number(metodoPagoId),
    estadoVoucherId: Number(estadoVoucherId),
    imagen, // Buffer o null
    pedidoId: Number(pedidoId),
    fecha: fechaNormalizada === undefined ? new Date() : fechaNormalizada,
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

async function findVoucherById(id) {
  const voucherId = assertIdPositivo(id, "id");
  const data = await repo.findVoucherMetaById(voucherId);
  if (!data) {
    const e = new Error(`Voucher ${voucherId} no encontrado`);
    e.status = 404;
    throw e;
  }
  return data;
}

async function updateVoucher(id, payload, file) {
  const voucherId = assertIdPositivo(id, "id");
  const current = await repo.findVoucherMetaById(voucherId);
  if (!current) {
    const e = new Error(`Voucher ${voucherId} no encontrado`);
    e.status = 404;
    throw e;
  }

  const monto =
    payload.monto != null
      ? assertNumber(payload.monto, "monto")
      : Number(current.monto ?? 0);
  const metodoPagoId =
    payload.metodoPagoId != null
      ? assertIdPositivo(payload.metodoPagoId, "metodoPagoId")
      : Number(current.metodoPagoId ?? 0);
  const estadoVoucherId =
    payload.estadoVoucherId != null
      ? assertIdPositivo(payload.estadoVoucherId, "estadoVoucherId")
      : Number(current.estadoVoucherId ?? 0);

  const fechaParsed = parseFecha(payload.fecha);
  const fecha =
    fechaParsed === undefined
      ? current.fecha ?? null
      : fechaParsed ?? null;

  const updateData = {
    id: voucherId,
    monto,
    metodoPagoId,
    estadoVoucherId,
    fecha,
  };

  if (file?.buffer) {
    updateData.imagen = file.buffer;
    updateData.mime = file.mimetype ?? null;
    updateData.nombre = file.originalname ?? null;
    updateData.size = file.size ?? null;
  }

  const affected = await repo.updateVoucher(updateData);
  if (!affected) {
    const e = new Error("No se pudo actualizar el voucher");
    e.status = 500;
    throw e;
  }

  return repo.findVoucherMetaById(voucherId);
}

async function deleteVoucher(id) {
  const voucherId = assertIdPositivo(id, "id");
  const deleted = await repo.deleteVoucher(voucherId);
  if (!deleted) {
    const e = new Error(`Voucher ${voucherId} no encontrado`);
    e.status = 404;
    throw e;
  }
  return { Status: "Voucher eliminado" };
}

module.exports = {
  listPendientes,
  listParciales,
  listPagados,
  listAllVouchers,
  getResumen,
  listVouchers,
  listMetodos,
  createVoucher,
  getVoucherImage,
  findVoucherById,
  updateVoucher,
  deleteVoucher,
};
