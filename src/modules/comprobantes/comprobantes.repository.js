// comprobantes.repository.js
const db = require("../../db");

async function getComprobantePdfByVoucherId(p_PK_Pa_Cod) {
  const id = Number(p_PK_Pa_Cod);
  if (!Number.isInteger(id) || id <= 0) {
    const e = new Error("voucherId inválido");
    e.status = 400;
    throw e;
  }

  const [rows] = await db.query("CALL SP_get_comprobante_pdf_by_voucher(?)", [id]);
  const header = rows?.[0]?.[0] || null;
  const items = Array.isArray(rows?.[1]) ? rows[1] : [];

  return { header, items };
}

// ✅ NUEVO: total del pedido = SUM(PS_Subtotal)
async function getSubtotalPedidoByPedidoId(pedidoId) {
  const id = Number(pedidoId);
  if (!Number.isInteger(id) || id <= 0) return 0;

  const [rows] = await db.query(
    "SELECT COALESCE(SUM(PS_Subtotal), 0) AS subtotalPedido FROM T_PedidoServicio WHERE FK_P_Cod = ?",
    [id]
  );

  return Number(rows?.[0]?.subtotalPedido ?? 0);
}

module.exports = { getComprobantePdfByVoucherId, getSubtotalPedidoByPedidoId };