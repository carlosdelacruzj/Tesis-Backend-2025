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
// repo.cotizacion.js (función listAll)
async function listAll({ estado } = {}) {
  const spRes = await callSP("CALL defaultdb.sp_cotizacion_listar()");

  // Normaliza posibles formas del resultado de CALL
  let rows;
  if (Array.isArray(spRes)) {
    rows = Array.isArray(spRes[0])
      ? Array.isArray(spRes[0][0])
        ? spRes[0][0]
        : spRes[0]
      : spRes;
  } else {
    rows = [];
  }

  const list = rows.map((r) => {
    const item = {
      id: Number(r.idCotizacion),
      estado: String(r.estado),
      fechaCreacion: r.fechaCreacion,
      eventoId: r.idTipoEvento ?? null, // <- del SP: Cot_IdTipoEvento AS idTipoEvento
      tipoEvento: r.tipoEvento,
      fechaEvento: r.fechaEvento,
      lugar: r.lugar,
      horasEstimadas:
      r.horasEstimadas != null ? Number(r.horasEstimadas) : null,
      mensaje: r.mensaje,
      total: r.total != null ? Number(r.total) : null,

      // 👇 bloque unificado 'contacto' (lo que quieres en la respuesta)
      contacto: {
        id: r.origen === "CLIENTE" ? r.idCliente : r.idLead,
        origen: r.origen, // 'CLIENTE' | 'LEAD'
        nombre: r.contactoNombre ?? null,
        celular: r.contactoCelular ?? null,
      },
    };

    return item;
  });

  return estado ? list.filter((x) => x.estado === estado) : list;
}

// ===================== OBTENER (JSON) =====================
async function findByIdWithItems(id) {
  const [rows0] = await callSP(
    "CALL defaultdb.sp_cotizacion_obtener_json_por_id(?)",
    [Number(id)]
  );
  if (!rows0 || !rows0.length) return null;

  // Tolera alias distintos y Buffer
  const row = rows0[0] || {};
  const raw =
    row.cotizacion_json ??
    row.detalle_json ??
    row.json ??
    row.data ??
    row[Object.keys(row).find((k) => /json/i.test(k))];

  const str = Buffer.isBuffer(raw) ? raw.toString("utf8") : raw;
  const data = typeof str === "string" ? JSON.parse(str) : str;

  return data || null; // { idCotizacion, lead, cotizacion, items: [...] }
}

// ===================== CREAR (ADMIN) =====================
async function createAdminV3({ cliente, lead, cotizacion, items = [] }) {
  const hasCliente = cliente && Number(cliente.id) > 0;

  // === map de items al contrato del SP (JSON) ===
  const itemsMapped = (items || []).map((it) => ({
    idEventoServicio: it.idEventoServicio ?? it.exsId ?? null,
    // el SP acepta nombre o titulo -> mandamos nombre si existe, si no titulo
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

  const params = [
    // 1) p_cliente_id (si viene >0, NO se crea lead)
    hasCliente ? n(cliente.id) : null,
    // 2–4) datos de lead SOLO si NO hay cliente
    hasCliente ? null : s(lead?.nombre),
    hasCliente ? null : s(lead?.celular),
    hasCliente ? null : s(lead?.origen ?? "Backoffice"),
    // 5–11) cabecera
    s(cotizacion?.tipoEvento),
    n(cotizacion?.idTipoEvento),
    s(cotizacion?.fechaEvento), // 'YYYY-MM-DD'
    s(cotizacion?.lugar),
    n(cotizacion?.horasEstimadas),
    s(cotizacion?.mensaje),
    s(cotizacion?.estado ?? "Borrador"),
    // 12) items JSON
    itemsMapped.length ? JSON.stringify(itemsMapped) : null,
  ];

  try {
    const [rows0] = await callSP(
      "CALL defaultdb.sp_cotizacion_crear_admin_v3(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      params
    );
    const out = rows0?.[0] || {};
    return {
      idCotizacion: out.idCotizacion ?? null,
      clienteId: out.clienteId ?? null,
      leadId: out.leadId ?? null,
      origen: out.origen ?? (hasCliente ? "CLIENTE" : "LEAD"),
    };
  } catch (err) {
    // Traduce mensajes del SIGNAL del SP a errores más claros
    const msg = String(err?.message || "");
    if (msg.match(/Cliente no existe/i))
      throw new Error("El cliente indicado no existe.");
    if (msg.match(/Se requiere nombre para crear el lead/i))
      throw new Error("Falta el nombre para crear el lead.");
    throw err;
  }
}
async function createAdmin(payload) {
  return createAdminV3(payload);
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
    "CALL defaultdb.sp_cotizacion_cambiar_estado(?,?,?)",
    [
      Number(id),
      String(estadoNuevo),
      estadoEsperado == null ? null : String(estadoEsperado),
    ]
  );

  // res => [ [ { detalle_json: '...' } ], ... ]
  const firstResultset = Array.isArray(res) ? res[0] : res;
  const firstRow = Array.isArray(firstResultset)
    ? firstResultset[0]
    : firstResultset;

  const raw = firstRow?.detalle_json || firstRow?.detalle; // por si el alias difiere
  const detalle = typeof raw === "string" ? JSON.parse(raw) : raw || null;

  return { detalle };
}
module.exports = {
  listAll,
  findByIdWithItems, // usa SP JSON
  createAdmin, // usa SP crear_admin
  createPublic, // usa SP crear_publica
  updateAdmin, // usa SP actualizar_admin (reemplaza ítems si se pasan)
  deleteById,
  cambiarEstado,
};
