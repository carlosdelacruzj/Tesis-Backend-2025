const repo = require("./pagos.repository");
const pool = require("../../db");
const { getLimaISODate } = require("../../utils/dates");
const { calcIgv, round2 } = require("../../utils/igv");

function badRequest(msg) {
  const e = new Error(msg);
  e.status = 400;
  return e;
}
const ESTADO_PAGO_PENDIENTE = "Pendiente";
const ESTADO_PAGO_PARCIAL = "Parcial";
const ESTADO_PAGO_PAGADO = "Pagado";
const ESTADO_PAGO_CERRADO = "Cerrado";
const ESTADO_PAGO_VENCIDO = "Vencido";
const CIERRE_FINANCIERO_RETENCION_CANCEL_CLIENTE = "RETENCION_CANCEL_CLIENTE";
const ESTADO_VOUCHER_APROBADO = "Aprobado";
const ESTADO_PEDIDO_COTIZADO = "Cotizado";
const ESTADO_PEDIDO_CONTRATADO = "Contratado";
const ESTADO_PEDIDO_EXPIRADO = "Expirado";
const ESTADO_PEDIDO_CANCELADO = "Cancelado";
const METODO_PAGO_TRANSFERENCIA = "Transferencia";
const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const isEnabled = (value) =>
  ["1", "true", "yes", "on"].includes(String(value ?? "0").toLowerCase());
const PEDIDOS_MODO_ESTRICTO = isEnabled(process.env.PEDIDOS_MODO_ESTRICTO);
const PEDIDOS_AUTO_VENCIMIENTO =
  PEDIDOS_MODO_ESTRICTO || isEnabled(process.env.PEDIDOS_AUTO_VENCIMIENTO ?? "1");
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
  const str = typeof value === "string" ? value.trim() : value;
  if (typeof str === "string" && ISO_DATE_ONLY.test(str)) {
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d); // local midnight evita saltos de día por zona horaria
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw badRequest(`${field} inválida`);
  return d;
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function applyIgvToResumen(resumen) {
  const hasBase = resumen?.CostoBase != null || resumen?.Igv != null;
  const montoAbonado = toNumber(resumen?.MontoAbonado);

  if (hasBase) {
    const base = toNumber(resumen?.CostoBase);
    const igv = toNumber(resumen?.Igv);
    const total = toNumber(resumen?.CostoTotal);
    const saldoPendiente = round2(total - montoAbonado);
    return {
      ...resumen,
      CostoBase: round2(base),
      Igv: round2(igv),
      CostoTotal: round2(total),
      SaldoPendiente: saldoPendiente < 0 ? 0 : saldoPendiente,
    };
  }

  const base = toNumber(resumen?.CostoTotal);
  const { igv, total } = calcIgv(base);
  const saldoPendiente = round2(total - montoAbonado);

  return {
    ...resumen,
    CostoBase: round2(base),
    Igv: igv,
    CostoTotal: total,
    SaldoPendiente: saldoPendiente < 0 ? 0 : saldoPendiente,
  };
}

async function syncEstadoPagoPedido(pedidoId, executor) {
  const resumenRows = await repo.getResumenByPedido(pedidoId, executor);
  let cierreFinanciero = null;
  let estadoPedido = null;
  try {
    cierreFinanciero = await repo.getPedidoCierreFinancieroTipo(pedidoId, executor);
  } catch (err) {
    if (err?.code !== "ER_BAD_FIELD_ERROR" && err?.errno !== 1054) throw err;
  }
  try {
    estadoPedido = await repo.getPedidoEstadoById(pedidoId, executor);
  } catch (err) {
    if (err?.code !== "ER_BAD_FIELD_ERROR" && err?.errno !== 1054) throw err;
  }
  const resumenRaw = resumenRows?.[0];
  if (!resumenRaw) {
    const e = new Error(`No se encontr� resumen de pago para pedido ${pedidoId}`);
    e.status = 404;
    throw e;
  }

  const resumen = applyIgvToResumen(resumenRaw);
  const costoTotal =
    resumenRaw?.CostoTotalOriginal != null
      ? toNumber(resumenRaw.CostoTotalOriginal)
      : toNumber(resumen.CostoTotal);
  const costoTotalNeto =
    resumenRaw?.CostoTotalNeto != null
      ? toNumber(resumenRaw.CostoTotalNeto)
      : toNumber(resumen.CostoTotal);
  const montoAbonado = toNumber(resumen.MontoAbonado);
  const saldoPendiente = round2(Math.max(costoTotalNeto - montoAbonado, 0));
  const montoPorDevolver = round2(Math.max(montoAbonado - costoTotalNeto, 0));

  const [pendienteId, parcialId, pagadoId, cerradoId, pedidoCanceladoId] = await Promise.all([
    repo.getEstadoPagoIdByNombre(ESTADO_PAGO_PENDIENTE, executor),
    repo.getEstadoPagoIdByNombre(ESTADO_PAGO_PARCIAL, executor),
    repo.getEstadoPagoIdByNombre(ESTADO_PAGO_PAGADO, executor),
    repo.getEstadoPagoIdByNombre(ESTADO_PAGO_CERRADO, executor),
    repo.getEstadoPedidoIdByNombre(ESTADO_PEDIDO_CANCELADO, executor),
  ]);

  let estadoPagoId = pendienteId;
  const pedidoEstaCancelado =
    Number(estadoPedido?.estadoPedidoId || 0) === Number(pedidoCanceladoId);

  if (
    cierreFinanciero?.cierreFinancieroTipo ===
    CIERRE_FINANCIERO_RETENCION_CANCEL_CLIENTE
  ) {
    estadoPagoId = cerradoId;
  } else if (pedidoEstaCancelado && montoAbonado > 0) {
    // Regla de negocio: pedido cancelado con abono se clasifica en cerrado.
    estadoPagoId = cerradoId;
  } else if (costoTotalNeto <= 0 || montoPorDevolver > 0) {
    estadoPagoId = cerradoId;
  } else if (saldoPendiente <= 0) {
    estadoPagoId = pagadoId;
  } else if (montoAbonado > 0) {
    estadoPagoId = parcialId;
  }

  await repo.updatePedidoEstadoPago(pedidoId, estadoPagoId, executor);

  return {
    estadoPagoId,
    costoTotal,
    costoTotalNeto,
    montoAbonado,
    saldoPendiente,
    montoPorDevolver,
  };
}

async function syncEstadoPagoPedidoById(pedidoId) {
  const id = assertIdPositivo(pedidoId, "pedidoId");
  await syncEstadoPagoPedido(id);
  return { Status: "Estado de pago sincronizado", pedidoId: id };
}

async function marcarPagosVencidosLocal() {
  if (!PEDIDOS_AUTO_VENCIMIENTO) return;
  const [pendienteId, vencidoId, pedidoExpiradoId] = await Promise.all([
    repo.getEstadoPagoIdByNombre(ESTADO_PAGO_PENDIENTE),
    repo.getEstadoPagoIdByNombre(ESTADO_PAGO_VENCIDO),
    repo.getEstadoPedidoIdByNombre(ESTADO_PEDIDO_EXPIRADO),
  ]);
  await repo.marcarPedidosPagoVencido({
    fechaCorte: getLimaISODate(),
    pendienteId,
    vencidoId,
    pedidoExpiradoId,
  });
}

async function listPendientes() {
  await marcarPagosVencidosLocal();
  return repo.listPendientes();
}
async function listParciales() {
  await marcarPagosVencidosLocal();
  return repo.listParciales();
}
async function listPagados() {
  await marcarPagosVencidosLocal();
  return repo.listPagados();
}
async function listCerrados() {
  await marcarPagosVencidosLocal();
  return repo.listCerrados();
}
async function listAllVouchers() {
  return repo.listAllVouchers();
}

async function getResumen(pedidoId) {
  const id = assertIdPositivo(pedidoId, "pedidoId");
  const rows = await repo.getResumenByPedido(id);
  // El SP retorna 1 fila; si no, devolvemos ceros para no romper el front
  const base = rows?.[0] ?? { CostoTotal: 0, MontoAbonado: 0, SaldoPendiente: 0 };
  const normalized = applyIgvToResumen(base);
  const montoAbonado = toNumber(base?.MontoAbonado);

  // Para el endpoint de resumen exponemos:
  // - CostoTotal como total original del pedido
  // - CostoTotalNeto como total luego de NC
  // Si el SP no trae CostoTotalOriginal/CostoTotalNeto, inferimos:
  //   original = CostoBase + Igv, neto = CostoTotal.
  const totalOriginal =
    base?.CostoTotalOriginal != null
      ? toNumber(base.CostoTotalOriginal)
      : base?.CostoBase != null || base?.Igv != null
      ? round2(toNumber(base.CostoBase) + toNumber(base.Igv))
      : toNumber(normalized?.CostoTotal);

  const totalNeto =
    base?.CostoTotalNeto != null
      ? toNumber(base.CostoTotalNeto)
      : toNumber(base?.CostoTotal ?? normalized?.CostoTotal);

  const [pedidoEstados, cerradoId, canceladoId] = await Promise.all([
    repo.getPedidoEstadosFinancierosById(id),
    repo.getEstadoPagoIdByNombre(ESTADO_PAGO_CERRADO),
    repo.getEstadoPedidoIdByNombre(ESTADO_PEDIDO_CANCELADO),
  ]);

  const saldoPendienteBruto = round2(Math.max(totalNeto - montoAbonado, 0));
  const pedidoEstaCancelado =
    Number(pedidoEstados?.estadoPedidoId || 0) === Number(canceladoId);
  const pagoEstaCerrado =
    Number(pedidoEstados?.estadoPagoId || 0) === Number(cerradoId);
  const saldoNoEsCobrable = pedidoEstaCancelado || pagoEstaCerrado;
  const saldoPendiente = saldoNoEsCobrable ? 0 : saldoPendienteBruto;
  const saldoNoCobrable = saldoNoEsCobrable ? saldoPendienteBruto : 0;

  return {
    ...normalized,
    CostoTotal: round2(totalOriginal),
    CostoTotalNeto: round2(totalNeto),
    SaldoPendiente: round2(saldoPendiente),
    SaldoNoCobrable: round2(saldoNoCobrable),
    MontoPorDevolver: round2(Math.max(montoAbonado - totalNeto, 0)),
  };
}

async function listVouchers(pedidoId) {
  const id = assertIdPositivo(pedidoId, "pedidoId");
  return repo.listVouchersByPedido(id);
}

async function listMetodos() {
  return repo.listMetodos();
}

async function listEstadosPago() {
  return repo.listEstadosPago();
}

async function isMetodoPagoTransferencia(metodoPagoId) {
  const id = assertIdPositivo(metodoPagoId, "metodoPagoId");
  const transferenciaId = await repo.getMetodoPagoIdByNombre(
    METODO_PAGO_TRANSFERENCIA
  );
  return id === transferenciaId;
}

async function createVoucher({
  file, // <-- ahora opcional
  pedidoId,
  monto,
  metodoPagoId,
  estadoVoucherId,
  fecha,
}) {
  const id = assertIdPositivo(pedidoId, "pedidoId");
  const montoNum = assertNumber(monto, "monto");
  assertIdPositivo(metodoPagoId, "metodoPagoId");
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    let estadoVoucherIdFinal = estadoVoucherId;
    if (estadoVoucherIdFinal == null || estadoVoucherIdFinal === "") {
      estadoVoucherIdFinal = await repo.getEstadoVoucherIdByNombre(
        ESTADO_VOUCHER_APROBADO,
        conn
      );
    }
    assertIdPositivo(estadoVoucherIdFinal, "estadoVoucherId");

    // Detectar si es el primer pago antes de insertar (MontoAbonado previo == 0)
    const resumenPrev = await repo.getResumenByPedido(id, conn);
    const montoAbonadoPrev = Number(resumenPrev?.[0]?.MontoAbonado ?? 0);
    const esPrimerPago = montoNum > 0 && montoAbonadoPrev <= 0;

    // Si no hay archivo, persistimos nulos en columnas de imagen
    const imagen = file?.buffer ?? null;
    const mime = file?.mimetype ?? null;
    const nombre = file?.originalname ?? null;
    const size = file?.size ?? null;
    const fechaNormalizada = parseFecha(fecha);

    const insertResult = await repo.insertVoucher({
      monto: Number(montoNum),
      metodoPagoId: Number(metodoPagoId),
      estadoVoucherId: Number(estadoVoucherIdFinal),
      imagen, // Buffer o null
      pedidoId: Number(pedidoId),
      fecha: fechaNormalizada === undefined ? getLimaISODate() : fechaNormalizada,
      mime, // string o null
      nombre, // string o null
      size, // number o null
    }, conn);
    const voucherId =
      insertResult?.[0]?.idVoucher ??
      insertResult?.idVoucher ??
      insertResult?.[0]?.ID ??
      insertResult?.ID ??
      null;

    // Si es el primer pago, pasamos el pedido a estado "Contratado" solo si estaba en "Cotizado"
    if (esPrimerPago) {
      try {
        const [cotizadoId, contratadoId] = await Promise.all([
          repo.getEstadoPedidoIdByNombre(ESTADO_PEDIDO_COTIZADO, conn),
          repo.getEstadoPedidoIdByNombre(ESTADO_PEDIDO_CONTRATADO, conn),
        ]);
        await repo.updatePedidoEstadoContratadoByIds(
          id,
          contratadoId,
          cotizadoId,
          conn
        );
      } catch (err) {
        // No bloqueamos el flujo de pago si falla el cambio de estado, pero registramos error
        // eslint-disable-next-line no-console
        console.error("[pagos] No se pudo actualizar estado de pedido a Contratado:", err.message);
      }
    }

    await syncEstadoPagoPedido(id, conn);
    await conn.commit();

    return { Status: "Voucher registrado", voucherId };
  } catch (err) {
    try {
      await conn.rollback();
    } catch (_rollbackErr) {
      // No-op: preservamos el error original de negocio/BD
    }
    throw err;
  } finally {
    conn.release();
  }
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

  await syncEstadoPagoPedido(current.pedidoId);

  return repo.findVoucherMetaById(voucherId);
}

async function deleteVoucher(id) {
  const voucherId = assertIdPositivo(id, "id");
  const current = await repo.findVoucherMetaById(voucherId);
  if (!current) {
    const e = new Error(`Voucher ${voucherId} no encontrado`);
    e.status = 404;
    throw e;
  }

  const deleted = await repo.deleteVoucher(voucherId);
  if (!deleted) {
    const e = new Error(`Voucher ${voucherId} no encontrado`);
    e.status = 404;
    throw e;
  }

  await syncEstadoPagoPedido(current.pedidoId);

  return { Status: "Voucher eliminado" };
}

module.exports = {
  listPendientes,
  listParciales,
  listPagados,
  listCerrados,
  listAllVouchers,
  marcarPagosVencidosLocal,
  getResumen,
  listVouchers,
  listMetodos,
  listEstadosPago,
  syncEstadoPagoPedidoById,
  createVoucher,
  getVoucherImage,
  findVoucherById,
  isMetodoPagoTransferencia,
  updateVoucher,
  deleteVoucher,
};


