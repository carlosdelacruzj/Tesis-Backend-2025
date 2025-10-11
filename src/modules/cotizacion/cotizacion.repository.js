// cotizacion.repository.js
const pool = require("../../db");

// Helper: ejecuta CALL y devuelve el/los resultsets ya “limpios”
async function callSP(sql, params = []) {
  const [res] = await pool.query(sql, params);
  // mysql2 para CALL devuelve: [ [rows0], [rows1], ... , meta ]
  if (Array.isArray(res) && Array.isArray(res[0])) return res;
  return [res]; // por si el driver retorna una sola capa
}

// Helper: normaliza números/strings
const n = (v) => (v == null ? null : Number(v));
const s = (v) => (v == null ? null : String(v));

// ===================== LISTAR =====================
async function listAll({ estado } = {}) {
  // Si no filtras por estado, usa el SP ya creado
  if (!estado) {
    const [rows0] = await callSP("CALL defaultdb.sp_cotizacion_listar()");
    return rows0; // lista plana (cabecera + lead + total calculado)
  }

  // (Opcional) Si quieres filtrar por estado vía SP, crea sp_cotizacion_listar_por_estado(estado)
  // Mientras tanto, fallback con SQL directo:
  const [rows] = await pool.query(
    `
    SELECT
      c.PK_Cot_Cod         AS id,
      c.FK_Lead_Cod        AS leadId,
      c.Cot_IdTipoEvento   AS eventoId,
      c.Cot_TipoEvento     AS tipoEvento,
      c.Cot_FechaEvento    AS fechaEvento,
      c.Cot_Lugar          AS lugar,
      c.Cot_HorasEst       AS horasEstimadas,
      c.Cot_Mensaje        AS mensaje,
      c.Cot_Estado         AS estado,
      c.Cot_Fecha_Crea     AS fechaCreacion,
      l.Lead_Nombre        AS leadNombre,
      l.Lead_Celular       AS leadCelular,
      l.Lead_Origen        AS leadOrigen,
      l.Lead_Fecha_Crea    AS leadFechaCreacion,
      COALESCE((
        SELECT SUM(cs.CS_Subtotal)
        FROM T_CotizacionServicio cs
        WHERE cs.FK_Cot_Cod = c.PK_Cot_Cod
      ),0) AS cot_total
    FROM T_Cotizacion c
    JOIN T_Lead l ON l.PK_Lead_Cod = c.FK_Lead_Cod
    WHERE c.Cot_Estado = ?
    ORDER BY c.Cot_Fecha_Crea DESC, c.PK_Cot_Cod DESC
  `,
    [estado]
  );
  return rows;
}

// ===================== OBTENER (JSON) =====================
async function findByIdWithItems(id) {
  const [rows0] = await callSP(
    "CALL defaultdb.sp_cotizacion_obtener_json_por_id(?)",
    [Number(id)]
  );
  if (!rows0.length) return null;
  // El SP retorna una fila con la columna cotizacion_json (JSON string o ya-JSON según mysql2)
  const raw = rows0[0].cotizacion_json;
  const data = typeof raw === "string" ? JSON.parse(raw) : raw;
  return data; // { idCotizacion, lead:{...}, cotizacion:{...}, items:[...] }
}

// ===================== CREAR (ADMIN) =====================
/**
 * Espera:
 * {
 *   lead: { id?, nombre, celular, origen },
 *   cotizacion: { tipoEvento, idTipoEvento, fechaEvento, lugar, horasEstimadas, mensaje, estado? },
 *   items: [{ idEventoServicio, nombre|titulo, descripcion, moneda, precioUnit|precioUnitario, cantidad, descuento, recargo, notas, horas, personal, fotosImpresas, trailerMin, filmMin }]
 * }
 */
async function createAdmin({ lead, cotizacion, items = [] }) {
  // Mapea items al contrato del SP en español
  const itemsMapped = (items || []).map((it) => ({
    idEventoServicio: it.idEventoServicio ?? it.exsId ?? null,
    nombre: s(it.nombre ?? it.titulo),
    descripcion: s(it.descripcion),
    moneda: s((it.moneda || "USD").toUpperCase()),
    precioUnit: n(it.precioUnit ?? it.precioUnitario),
    cantidad: n(it.cantidad ?? 1),
    descuento: n(it.descuento ?? 0),
    recargo: n(it.recargo ?? 0),
    notas: s(it.notas),
    horas: n(it.horas),
    personal: n(it.personal),
    fotosImpresas: n(it.fotosImpresas),
    trailerMin: n(it.trailerMin),
    filmMin: n(it.filmMin),
  }));

  const itemsJson = JSON.stringify(itemsMapped);

  const params = [
    // p_lead_id (puede ser null/<=0 para crear)
    lead?.id ?? null,
    // datos lead si se crea:
    s(lead?.nombre ?? null),
    s(lead?.celular ?? null),
    s(lead?.origen ?? "Backoffice"),
    // cabecera cotización:
    s(cotizacion?.tipoEvento),
    n(cotizacion?.idTipoEvento),
    s(cotizacion?.fechaEvento), // YYYY-MM-DD
    s(cotizacion?.lugar),
    n(cotizacion?.horasEstimadas),
    s(cotizacion?.mensaje),
    s(cotizacion?.estado ?? "Borrador"),
    // items JSON
    itemsMapped.length ? itemsJson : null,
  ];

  const [rows0] = await callSP(
    "CALL defaultdb.sp_cotizacion_crear_admin(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    params
  );
  // SP devuelve: SELECT v_cot_id AS idCotizacion;
  const idCotizacion = rows0[0]?.idCotizacion;
  return { idCotizacion };
}

// ===================== CREAR (PÚBLICA/WEB) =====================
/**
 * Espera:
 * { lead: { nombre, celular, origen }, cotizacion: { tipoEvento, idTipoEvento, fechaEvento, lugar, horasEstimadas, mensaje } }
 * Retorna: { lead_id, cotizacion_id } según SP.
 */
async function createPublic({ lead, cotizacion }) {
  const params = [
    s(lead?.nombre),
    s(lead?.celular),
    s(lead?.origen ?? "Web"),
    s(cotizacion?.tipoEvento),
    n(cotizacion?.idTipoEvento),
    s(cotizacion?.fechaEvento),
    s(cotizacion?.lugar),
    n(cotizacion?.horasEstimadas),
    s(cotizacion?.mensaje),
  ];
  const [rows0] = await callSP(
    "CALL defaultdb.sp_cotizacion_crear_publica(?, ?, ?, ?, ?, ?, ?, ?, ?)",
    params
  );
  // SP retorna una fila con { lead_id, cotizacion_id }
  return rows0[0];
}

// ===================== ACTUALIZAR (ADMIN) =====================
/**
 * updateAdmin(id, { cotizacion?, items? })
 * - cotizacion: campos parciales (mismos nombres que createAdmin.cotizacion)
 * - items: reemplaza TODO el set si se envía (mismo formato que en createAdmin)
 */
async function updateAdmin(id, { cotizacion = {}, items } = {}) {
  const itemsMapped = Array.isArray(items)
    ? items.map((it) => ({
        idEventoServicio: it.idEventoServicio ?? it.exsId ?? null,
        nombre: s(it.nombre ?? it.titulo),
        descripcion: s(it.descripcion),
        moneda: s((it.moneda || "USD").toUpperCase()),
        precioUnit: n(it.precioUnit ?? it.precioUnitario),
        cantidad: n(it.cantidad ?? 1),
        descuento: n(it.descuento ?? 0),
        recargo: n(it.recargo ?? 0),
        notas: s(it.notas),
        horas: n(it.horas),
        personal: n(it.personal),
        fotosImpresas: n(it.fotosImpresas),
        trailerMin: n(it.trailerMin),
        filmMin: n(it.filmMin),
      }))
    : null;

  const params = [
    Number(id),
    s(cotizacion.tipoEvento ?? null),
    n(cotizacion.idTipoEvento ?? null),
    s(cotizacion.fechaEvento ?? null),
    s(cotizacion.lugar ?? null),
    n(cotizacion.horasEstimadas ?? null),
    s(cotizacion.mensaje ?? null),
    s(cotizacion.estado ?? null),
    itemsMapped ? JSON.stringify(itemsMapped) : null,
  ];

  await callSP(
    "CALL defaultdb.sp_cotizacion_actualizar_admin(?, ?, ?, ?, ?, ?, ?, ?, ?)",
    params
  );
  return { updated: true };
}

// ===================== DELETE =====================
async function deleteById(id) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      `SELECT FK_Lead_Cod FROM T_Cotizacion WHERE PK_Cot_Cod = ? FOR UPDATE`,
      [Number(id)]
    );
    if (!rows.length) {
      await conn.rollback();
      return { deleted: false };
    }
    const leadId = rows[0].FK_Lead_Cod;

    await conn.query(`DELETE FROM T_Cotizacion WHERE PK_Cot_Cod = ?`, [
      Number(id),
    ]);

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
// Cambiar estado (usa el SP con concurrencia opcional)
// cotizacion.repository.js
async function cambiarEstado(id, { estadoNuevo, estadoEsperado = null } = {}) {
  const [res] = await pool.query(
    'CALL defaultdb.sp_cotizacion_cambiar_estado(?,?,?)',
    [Number(id), String(estadoNuevo), estadoEsperado == null ? null : String(estadoEsperado)]
  );

  // res => [ [ { detalle_json: '...' } ], ... ]
  const firstResultset = Array.isArray(res) ? res[0] : res;
  const firstRow = Array.isArray(firstResultset) ? firstResultset[0] : firstResultset;

  const raw = firstRow?.detalle_json || firstRow?.detalle; // por si el alias difiere
  const detalle = typeof raw === 'string' ? JSON.parse(raw) : raw || null;

  return { detalle };
}
module.exports = {
  listAll,
  findByIdWithItems, // usa SP JSON
  createAdmin, // usa SP crear_admin
  createPublic, // usa SP crear_publica
  updateAdmin, // usa SP actualizar_admin (reemplaza ítems si se pasan)
  deleteById,
  cambiarEstado
};
