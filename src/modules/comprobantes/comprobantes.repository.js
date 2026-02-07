// src/modules/comprobantes/comprobantes.repository.js
const db = require("../../db"); // ajusta si tu import es distinto

async function callSp(spName, params = []) {
  const placeholders = params.map(() => "?").join(",");
  const sql = `CALL ${spName}(${placeholders});`;
  const [rows] = await db.query(sql, params);

  // mysql2: CALL devuelve array de resultsets
  // rows[0] = header, rows[1] = items
  const header = rows?.[0]?.[0] ?? null;
  const items = rows?.[1] ?? [];
  return { header, items };
}

async function getVoucherById(voucherId) {
  const sql = `
    SELECT PK_Pa_Cod, Pa_Monto_Depositado, FK_P_Cod
    FROM T_Voucher
    WHERE PK_Pa_Cod = ?
    LIMIT 1;
  `;
  const [rows] = await db.query(sql, [voucherId]);
  return rows?.[0] ?? null;
}

async function getComprobantePdfByVoucherId(voucherId) {
  const v = await getVoucherById(voucherId);
  if (!v) return { header: null, items: [] };

  const monto = Number(v.Pa_Monto_Depositado ?? 0);

  // ✅ Nota de Crédito: voucher negativo -> SP NC (SOLO 1 ARG)
  // OJO: aquí NO creamos nada, solo leemos para generar PDF.
  if (monto < 0) {
    return await callSp("SP_get_nota_credito_pdf_by_voucher", [voucherId]);
  }

  // ✅ Boleta/Factura: voucher positivo
  return await callSp("SP_get_comprobante_pdf_by_voucher", [voucherId]);
}

module.exports = {
  getComprobantePdfByVoucherId,
};
