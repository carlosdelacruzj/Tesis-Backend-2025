const pool = require("../../db");

async function runQuery(sql, params = [], executor = pool) {
  const [rows] = await executor.query(sql, params);
  return rows;
}

async function getById(id, executor = pool) {
  const rows = await runQuery(
    `SELECT
       PK_Cont_Cod AS id,
       FK_P_Cod AS pedidoId,
       Cont_Version AS version,
       Cont_Estado AS estado,
       Cont_Link AS link,
       Cont_Pdf_Link AS pdfLink,
       Cont_Snapshot AS snapshot,
       Cont_SnapshotHash AS snapshotHash,
       Cont_EsVigente AS esVigente,
       Cont_Fecha_Crea AS fechaCreacion,
       Cont_Fecha_Cierre AS fechaCierre
     FROM T_Contrato
     WHERE PK_Cont_Cod = ?
     LIMIT 1`,
    [Number(id)],
    executor
  );
  return rows?.[0] || null;
}

async function listByPedidoId(pedidoId, executor = pool) {
  return runQuery(
    `SELECT
       PK_Cont_Cod AS id,
       FK_P_Cod AS pedidoId,
       Cont_Version AS version,
       Cont_Estado AS estado,
       Cont_Link AS link,
       Cont_Pdf_Link AS pdfLink,
       Cont_SnapshotHash AS snapshotHash,
       Cont_EsVigente AS esVigente,
       Cont_Fecha_Crea AS fechaCreacion,
       Cont_Fecha_Cierre AS fechaCierre
     FROM T_Contrato
     WHERE FK_P_Cod = ?
     ORDER BY Cont_Version DESC, PK_Cont_Cod DESC`,
    [Number(pedidoId)],
    executor
  );
}

async function getVigenteByPedidoId(pedidoId, executor = pool) {
  const rows = await runQuery(
    `SELECT
       PK_Cont_Cod AS id,
       FK_P_Cod AS pedidoId,
       Cont_Version AS version,
       Cont_Estado AS estado,
       Cont_Link AS link,
       Cont_Pdf_Link AS pdfLink,
       Cont_Snapshot AS snapshot,
       Cont_SnapshotHash AS snapshotHash,
       Cont_EsVigente AS esVigente,
       Cont_Fecha_Crea AS fechaCreacion,
       Cont_Fecha_Cierre AS fechaCierre
     FROM T_Contrato
     WHERE FK_P_Cod = ? AND Cont_EsVigente = 1
     ORDER BY Cont_Version DESC, PK_Cont_Cod DESC
     LIMIT 1`,
    [Number(pedidoId)],
    executor
  );
  return rows?.[0] || null;
}

async function createVersionFromSnapshot(
  { pedidoId, snapshotJson, snapshotHash, estado = "BORRADOR", link = null, pdfLink = null },
  executor = pool
) {
  const conn = executor === pool ? await pool.getConnection() : executor;
  const release = executor === pool;
  try {
    await conn.beginTransaction();
    const [maxRows] = await conn.query(
      `SELECT COALESCE(MAX(Cont_Version), 0) AS maxVersion
       FROM T_Contrato
       WHERE FK_P_Cod = ?
       FOR UPDATE`,
      [Number(pedidoId)]
    );
    const nextVersion = Number(maxRows?.[0]?.maxVersion || 0) + 1;

    await conn.query(
      `UPDATE T_Contrato
       SET Cont_EsVigente = 0
       WHERE FK_P_Cod = ? AND Cont_EsVigente = 1`,
      [Number(pedidoId)]
    );

    const [ins] = await conn.query(
      `INSERT INTO T_Contrato
       (Cont_Link, FK_P_Cod, Cont_Version, Cont_Estado, Cont_Snapshot, Cont_SnapshotHash, Cont_EsVigente, Cont_Pdf_Link)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
      [
        link,
        Number(pedidoId),
        nextVersion,
        String(estado || "BORRADOR"),
        snapshotJson,
        snapshotHash,
        pdfLink,
      ]
    );

    await conn.commit();
    return { id: ins.insertId, pedidoId: Number(pedidoId), version: nextVersion };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    if (release) conn.release();
  }
}

async function closeVigenteByPedidoId(pedidoId, executor = pool) {
  const [result] = await executor.query(
    `UPDATE T_Contrato
     SET Cont_Estado = 'FINAL',
         Cont_Fecha_Cierre = NOW()
     WHERE FK_P_Cod = ? AND Cont_EsVigente = 1`,
    [Number(pedidoId)]
  );
  return result?.affectedRows || 0;
}

async function updatePdfLinkById(id, pdfLink, executor = pool) {
  const [result] = await executor.query(
    `UPDATE T_Contrato
     SET Cont_Pdf_Link = ?
     WHERE PK_Cont_Cod = ?`,
    [pdfLink, Number(id)]
  );
  return result?.affectedRows || 0;
}

async function listGestion({
  estado = null,
  vigente = null,
  q = null,
  soloUltimaVersion = true,
} = {}) {
  const filters = [];
  const params = [];

  if (estado) {
    filters.push("c.Cont_Estado = ?");
    params.push(String(estado).trim());
  }
  if (vigente != null) {
    filters.push("c.Cont_EsVigente = ?");
    params.push(Number(vigente) ? 1 : 0);
  }
  if (q) {
    filters.push(
      `(CAST(c.PK_Cont_Cod AS CHAR) LIKE ? OR CAST(c.FK_P_Cod AS CHAR) LIKE ? OR u.U_Numero_Documento LIKE ? OR CONCAT_WS(' ', u.U_Nombre, u.U_Apellido, cte.Cli_RazonSocial) LIKE ?)`
    );
    const like = `%${String(q).trim()}%`;
    params.push(like, like, like, like);
  }

  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const joinUltima = soloUltimaVersion
    ? `INNER JOIN (
         SELECT FK_P_Cod AS pedidoId, MAX(Cont_Version) AS maxVersion
         FROM T_Contrato
         GROUP BY FK_P_Cod
       ) uv
         ON uv.pedidoId = c.FK_P_Cod
        AND uv.maxVersion = c.Cont_Version`
    : "";

  const [rows] = await pool.query(
    `SELECT
       c.PK_Cont_Cod AS contratoId,
       c.FK_P_Cod AS pedidoId,
       c.Cont_Version AS versionContrato,
       c.Cont_Estado AS estadoContrato,
       c.Cont_EsVigente AS esVigente,
       c.Cont_Fecha_Crea AS fechaContrato,
       c.Cont_Pdf_Link AS pdfLink,
       p.FK_EP_Cod AS estadoPedidoId,
       ep.EP_Nombre AS estadoPedidoNombre,
       u.U_Nombre AS clienteNombres,
       u.U_Apellido AS clienteApellidos,
       cte.Cli_RazonSocial AS clienteRazonSocial,
       u.U_Numero_Documento AS clienteDocumento
     FROM T_Contrato c
     ${joinUltima}
     INNER JOIN T_Pedido p
       ON p.PK_P_Cod = c.FK_P_Cod
     LEFT JOIN T_Estado_Pedido ep
       ON ep.PK_EP_Cod = p.FK_EP_Cod
     LEFT JOIN T_Cliente cte
       ON cte.PK_Cli_Cod = p.FK_Cli_Cod
     LEFT JOIN T_Usuario u
       ON u.PK_U_Cod = cte.FK_U_Cod
     ${where}
     ORDER BY c.Cont_Fecha_Crea DESC, c.PK_Cont_Cod DESC`,
    params
  );
  return rows;
}

module.exports = {
  getById,
  listByPedidoId,
  getVigenteByPedidoId,
  createVersionFromSnapshot,
  closeVigenteByPedidoId,
  updatePdfLinkById,
  listGestion,
};
