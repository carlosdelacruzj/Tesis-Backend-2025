const db = require("../../db"); // <- apunta a src/db/index.js

async function getComprobantePdfByVoucherId(p_PK_Pa_Cod) {
  const id = Number(p_PK_Pa_Cod);
  if (!Number.isInteger(id) || id <= 0) {
    const e = new Error("voucherId inválido");
    e.status = 400;
    throw e;
  }

  // 2 resultsets: [0]=cabecera[], [1]=detalle[]
  const [rows] = await db.query("CALL SP_get_comprobante_pdf_by_voucher(?)", [id]);

  const header = rows?.[0]?.[0] || null;
  const items = Array.isArray(rows?.[1]) ? rows[1] : [];

  return { header, items };
}

module.exports = { getComprobantePdfByVoucherId };