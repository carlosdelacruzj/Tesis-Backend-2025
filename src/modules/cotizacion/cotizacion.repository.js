const pool = require("../../db");

async function runQuery(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function listAll({ estado } = {}) {
  const sql = `
    SELECT
      c.PK_Cot_Cod      AS id,
      c.FK_Lead_Cod     AS leadId,
      c.Cot_TipoEvento AS tipoEvento,
      c.Cot_FechaEvento  AS fechaEvento,
      c.Cot_Lugar        AS lugar,
      c.Cot_HorasEst     AS horasEstimadas,
      c.Cot_Mensaje      AS mensaje,
      c.Cot_Estado       AS estado,
      c.Cot_Fecha_Crea   AS fechaCreacion,
      l.Lead_Nombre      AS leadNombre,
      l.Lead_Celular     AS leadCelular,
      l.Lead_Origen      AS leadOrigen,
      l.Lead_Fecha_Crea  AS leadFechaCreacion
    FROM T_Cotizacion c
    JOIN T_Lead l ON l.PK_Lead_Cod = c.FK_Lead_Cod
    ${estado ? "WHERE c.Cot_Estado = ?" : ""}
    ORDER BY c.Cot_Fecha_Crea DESC, c.PK_Cot_Cod DESC
  `;
  return runQuery(sql, estado ? [estado] : []);
}

async function findById(id) {
  const rows = await runQuery(
    `
    SELECT
      c.PK_Cot_Cod      AS id,
      c.FK_Lead_Cod     AS leadId,
      c.Cot_TipoEvento   AS tipoEvento,
      c.Cot_FechaEvento  AS fechaEvento,
      c.Cot_Lugar        AS lugar,
      c.Cot_HorasEst     AS horasEstimadas,
      c.Cot_Mensaje      AS mensaje,
      c.Cot_Estado       AS estado,
      c.Cot_Fecha_Crea   AS fechaCreacion,
      l.Lead_Nombre      AS leadNombre,
      l.Lead_Celular     AS leadCelular,
      l.Lead_Origen      AS leadOrigen,
      l.Lead_Fecha_Crea  AS leadFechaCreacion
    FROM T_Cotizacion c
    JOIN T_Lead l ON l.PK_Lead_Cod = c.FK_Lead_Cod
    WHERE c.PK_Cot_Cod = ?
    LIMIT 1
  `,
    [Number(id)]
  );
  return rows[0] || null;
}

async function create({ lead, cotizacion }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [leadResult] = await conn.query(
      `INSERT INTO T_Lead (Lead_Nombre, Lead_Celular, Lead_Origen)
       VALUES (?, ?, ?)`,
      [lead.nombre, lead.celular, lead.origen]
    );
    const leadId = leadResult.insertId;

    const [cotResult] = await conn.query(
      `INSERT INTO T_Cotizacion
         (FK_Lead_Cod, Cot_TipoEvento, Cot_FechaEvento, Cot_Lugar,
          Cot_HorasEst, Cot_Mensaje, Cot_Estado)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        leadId,
        cotizacion.tipoEvento,
        cotizacion.fechaEvento,
        cotizacion.lugar,
        cotizacion.horasEstimadas,
        cotizacion.mensaje,
        cotizacion.estado,
      ]
    );

    await conn.commit();
    return { leadId, cotizacionId: cotResult.insertId };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function updateLead(leadId, fields = {}) {
  const sets = [];
  const params = [];
  if (fields.nombre !== undefined) {
    sets.push("Lead_Nombre = ?");
    params.push(fields.nombre);
  }
  if (fields.celular !== undefined) {
    sets.push("Lead_Celular = ?");
    params.push(fields.celular);
  }
  if (fields.origen !== undefined) {
    sets.push("Lead_Origen = ?");
    params.push(fields.origen);
  }
  if (!sets.length) return;
  params.push(leadId);
  await runQuery(
    `UPDATE T_Lead SET ${sets.join(", ")} WHERE PK_Lead_Cod = ?`,
    params
  );
}

async function updateCotizacion(id, fields = {}) {
  const sets = [];
  const params = [];
  if (fields.tipoEvento !== undefined) {
    sets.push("Cot_TipoEvento = ?");
    params.push(fields.tipoEvento);
  }
  if (fields.fechaEvento !== undefined) {
    sets.push("Cot_FechaEvento = ?");
    params.push(fields.fechaEvento);
  }
  if (fields.lugar !== undefined) {
    sets.push("Cot_Lugar = ?");
    params.push(fields.lugar);
  }
  if (fields.horasEstimadas !== undefined) {
    sets.push("Cot_HorasEst = ?");
    params.push(fields.horasEstimadas);
  }
  if (fields.mensaje !== undefined) {
    sets.push("Cot_Mensaje = ?");
    params.push(fields.mensaje);
  }
  if (fields.estado !== undefined) {
    sets.push("Cot_Estado = ?");
    params.push(fields.estado);
  }
  if (!sets.length) return;
  params.push(id);
  await runQuery(
    `UPDATE T_Cotizacion SET ${sets.join(", ")} WHERE PK_Cot_Cod = ?`,
    params
  );
}

async function deleteById(id) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      `SELECT FK_Lead_Cod FROM T_Cotizacion WHERE PK_Cot_Cod = ? FOR UPDATE`,
      [id]
    );
    if (!rows.length) {
      await conn.rollback();
      return { deleted: false };
    }
    const leadId = rows[0].FK_Lead_Cod;

    await conn.query(`DELETE FROM T_Cotizacion WHERE PK_Cot_Cod = ?`, [id]);

    const [countRows] = await conn.query(
      `SELECT COUNT(*) AS total FROM T_Cotizacion WHERE FK_Lead_Cod = ?`,
      [leadId]
    );
    let leadDeleted = false;
    if (countRows[0]?.total === 0) {
      await conn.query(`DELETE FROM T_Lead WHERE PK_Lead_Cod = ?`, [leadId]);
      leadDeleted = true;
    }

    await conn.commit();
    return { deleted: true, leadDeleted };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = {
  listAll,
  findById,
  create,
  updateLead,
  updateCotizacion,
  deleteById,
};
