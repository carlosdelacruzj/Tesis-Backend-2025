const pool = require("../../db");

async function getById(id, executor = pool) {
  const [rows] = await executor.query(
    `SELECT
       PK_CotVer_Cod AS id,
       FK_Cot_Cod AS cotizacionId,
       CotVer_Version AS version,
       CotVer_Estado AS estado,
       CotVer_Snapshot AS snapshot,
       CotVer_SnapshotHash AS snapshotHash,
       CotVer_EsVigente AS esVigente,
       CotVer_Fecha_Crea AS fechaCreacion,
       CotVer_Fecha_Cierre AS fechaCierre,
       CotVer_Pdf_Link AS pdfLink
     FROM T_CotizacionVersion
     WHERE PK_CotVer_Cod = ?
     LIMIT 1`,
    [Number(id)]
  );
  return rows?.[0] || null;
}

async function listByCotizacionId(cotizacionId, executor = pool) {
  const [rows] = await executor.query(
    `SELECT
       PK_CotVer_Cod AS id,
       FK_Cot_Cod AS cotizacionId,
       CotVer_Version AS version,
       CotVer_Estado AS estado,
       CotVer_SnapshotHash AS snapshotHash,
       CotVer_EsVigente AS esVigente,
       CotVer_Fecha_Crea AS fechaCreacion,
       CotVer_Fecha_Cierre AS fechaCierre,
       CotVer_Pdf_Link AS pdfLink
     FROM T_CotizacionVersion
     WHERE FK_Cot_Cod = ?
     ORDER BY CotVer_Version DESC, PK_CotVer_Cod DESC`,
    [Number(cotizacionId)]
  );
  return rows || [];
}

async function getVigenteByCotizacionId(cotizacionId, executor = pool) {
  const [rows] = await executor.query(
    `SELECT
       PK_CotVer_Cod AS id,
       FK_Cot_Cod AS cotizacionId,
       CotVer_Version AS version,
       CotVer_Estado AS estado,
       CotVer_Snapshot AS snapshot,
       CotVer_SnapshotHash AS snapshotHash,
       CotVer_EsVigente AS esVigente,
       CotVer_Fecha_Crea AS fechaCreacion,
       CotVer_Fecha_Cierre AS fechaCierre,
       CotVer_Pdf_Link AS pdfLink
     FROM T_CotizacionVersion
     WHERE FK_Cot_Cod = ? AND CotVer_EsVigente = 1
     ORDER BY CotVer_Version DESC, PK_CotVer_Cod DESC
     LIMIT 1`,
    [Number(cotizacionId)]
  );
  return rows?.[0] || null;
}

async function createVersionFromSnapshot(
  {
    cotizacionId,
    snapshotJson,
    snapshotHash,
    estado = "BORRADOR",
    pdfLink = null,
  },
  executor = pool
) {
  const conn = executor === pool ? await pool.getConnection() : executor;
  const release = executor === pool;
  try {
    await conn.beginTransaction();

    const [maxRows] = await conn.query(
      `SELECT COALESCE(MAX(CotVer_Version), 0) AS maxVersion
       FROM T_CotizacionVersion
       WHERE FK_Cot_Cod = ?
       FOR UPDATE`,
      [Number(cotizacionId)]
    );
    const nextVersion = Number(maxRows?.[0]?.maxVersion || 0) + 1;

    await conn.query(
      `UPDATE T_CotizacionVersion
       SET CotVer_EsVigente = 0
       WHERE FK_Cot_Cod = ? AND CotVer_EsVigente = 1`,
      [Number(cotizacionId)]
    );

    const [ins] = await conn.query(
      `INSERT INTO T_CotizacionVersion
       (FK_Cot_Cod, CotVer_Version, CotVer_Estado, CotVer_Snapshot, CotVer_SnapshotHash, CotVer_EsVigente, CotVer_Pdf_Link)
       VALUES (?, ?, ?, ?, ?, 1, ?)`,
      [
        Number(cotizacionId),
        nextVersion,
        String(estado || "BORRADOR"),
        snapshotJson,
        snapshotHash,
        pdfLink,
      ]
    );

    await conn.commit();
    return { id: ins.insertId, cotizacionId: Number(cotizacionId), version: nextVersion };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    if (release) conn.release();
  }
}

async function closeVigenteByCotizacionId(cotizacionId, executor = pool) {
  const [result] = await executor.query(
    `UPDATE T_CotizacionVersion
     SET CotVer_Estado = 'FINAL',
         CotVer_Fecha_Cierre = NOW()
     WHERE FK_Cot_Cod = ? AND CotVer_EsVigente = 1`,
    [Number(cotizacionId)]
  );
  return result?.affectedRows || 0;
}

async function updatePdfLinkById(id, pdfLink, executor = pool) {
  const [result] = await executor.query(
    `UPDATE T_CotizacionVersion
     SET CotVer_Pdf_Link = ?
     WHERE PK_CotVer_Cod = ?`,
    [pdfLink, Number(id)]
  );
  return result?.affectedRows || 0;
}

module.exports = {
  getById,
  listByCotizacionId,
  getVigenteByCotizacionId,
  createVersionFromSnapshot,
  closeVigenteByCotizacionId,
  updatePdfLinkById,
};
