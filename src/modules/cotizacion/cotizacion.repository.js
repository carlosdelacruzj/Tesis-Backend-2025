// cotizacion.repository.js
const pool = require("../../db");
const { formatCodigo } = require("../../utils/codigo");
const { getLimaDateTimeString, getLimaISODate } = require("../../utils/dates");

// Helper: ejecuta CALL y devuelve el/los resultsets ya â€œlimpiosâ€
async function callSP(sql, params = []) {
  const [res] = await pool.query(sql, params);
  // mysql2 para CALL devuelve: [ [rows0], [rows1], ... , meta ]
  if (Array.isArray(res) && Array.isArray(res[0])) return res;
  return [res]; // por si el driver retorna una sola capa
}

// Helper: normaliza nÃºmeros/strings
const n = (v) => (v == null ? null : Number(v));
const s = (v) => (v == null ? null : String(v));

// ===================== LISTAR =====================
// repo.cotizacion.js (funciÃ³n listAll)
async function listAll({ estado } = {}) {
  const spRes = await callSP("CALL defaultdb.sp_cotizacion_listar_general()");

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
      codigo: formatCodigo("COT", r.idCotizacion),
      estado: String(r.estado),
      fechaCreacion: r.fechaCreacion ?? r.Cot_Fecha_Crea,
      eventoId: r.idTipoEvento ?? null, // <- del SP: Cot_IdTipoEvento AS idTipoEvento
      tipoEvento: r.tipoEvento,
      fechaEvento: r.fechaEvento,
      lugar: r.lugar,
      horasEstimadas:
      r.horasEstimadas != null ? Number(r.horasEstimadas) : null,
      dias: r.dias != null ? Number(r.dias) : (r.Cot_Dias != null ? Number(r.Cot_Dias) : null),
      viaticosMonto:
        r.viaticosMonto != null ? Number(r.viaticosMonto)
        : (r.Cot_ViaticosMonto != null ? Number(r.Cot_ViaticosMonto) : null),
      mensaje: r.mensaje,
      total: r.total != null ? Number(r.total) : null,

      // ðŸ‘‡ bloque unificado 'contacto' (lo que quieres en la respuesta)
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
    "CALL defaultdb.sp_cotizacion_obtener_json(?)",
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
  if (data && !Array.isArray(data.eventos)) data.eventos = [];

  return data || null; // { idCotizacion, lead, cotizacion, items: [...], eventos: [...] }
}

// ===================== SERVICIOS POR FECHA =====================
async function listServiciosByCotizacionId(cotizacionId) {
  const [rows] = await pool.query(
    `SELECT PK_CotServ_Cod AS idCotizacionServicio
     FROM T_CotizacionServicio
     WHERE FK_Cot_Cod = ?
     ORDER BY PK_CotServ_Cod ASC`,
    [Number(cotizacionId)]
  );
  return rows || [];
}

async function listServiciosFechasByCotizacionId(cotizacionId) {
  const [rows] = await pool.query(
    `SELECT FK_CotServ_Cod AS idCotizacionServicio, CSF_Fecha AS fecha
     FROM T_CotizacionServicioFecha
     WHERE FK_Cot_Cod = ?
     ORDER BY FK_CotServ_Cod ASC, CSF_Fecha ASC`,
    [Number(cotizacionId)]
  );
  return rows || [];
}

async function replaceServiciosFechas(cotizacionId, rows = []) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      `DELETE FROM T_CotizacionServicioFecha WHERE FK_Cot_Cod = ?`,
      [Number(cotizacionId)]
    );

    if (rows.length) {
      const values = rows.map((r) => [
        Number(cotizacionId),
        Number(r.idCotizacionServicio),
        r.fecha,
      ]);
      await conn.query(
        `INSERT INTO T_CotizacionServicioFecha
           (FK_Cot_Cod, FK_CotServ_Cod, CSF_Fecha)
         VALUES ?`,
        [values]
      );
    }

    await conn.commit();
    return { updated: true };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// ===================== CREAR (ADMIN) =====================
async function createAdminV3({ cliente, lead, cotizacion, items = [], eventos = [] }) {
  const hasCliente = cliente && Number(cliente.id) > 0;
  const fechaCreacion = getLimaDateTimeString();

  // === map de items al contrato del SP (JSON) ===
  const itemsMapped = (items || []).map((it) => ({
    idEventoServicio: it.idEventoServicio ?? it.exsId ?? null,
    eventoId: it.eventoId ?? null,
    servicioId: it.servicioId ?? null,
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

  const eventosMapped = Array.isArray(eventos)
    ? eventos
        .filter((evt) => evt && evt.fecha)
        .map((evt) => ({
          fecha: s(evt.fecha),
          hora: s(evt.hora),
          ubicacion: s(evt.ubicacion),
          direccion: s(evt.direccion),
          notas: s(evt.notas),
        }))
    : [];

  const params = [
    // 1) p_cliente_id (si viene >0, NO se crea lead)
    hasCliente ? n(cliente.id) : null,
    // 2â€“4) datos de lead SOLO si NO hay cliente
    hasCliente ? null : s(lead?.nombre),
    hasCliente ? null : s(lead?.celular),
    hasCliente ? null : s(lead?.origen ?? "Backoffice"),
    // 5â€“11) cabecera
    s(cotizacion?.tipoEvento),
    n(cotizacion?.idTipoEvento),
    s(cotizacion?.fechaEvento), // 'YYYY-MM-DD'
    s(cotizacion?.lugar),
    n(cotizacion?.horasEstimadas),
    n(cotizacion?.dias),
    n(cotizacion?.viaticosMonto),
    s(cotizacion?.mensaje),
    s(cotizacion?.estado ?? "Borrador"),
    // 12) fecha creacion Lima
    fechaCreacion,
    // 13) items JSON
    itemsMapped.length ? JSON.stringify(itemsMapped) : null,
    // 14) eventos JSON
    eventosMapped.length ? JSON.stringify(eventosMapped) : null,
  ];

  try {
    const [rows0] = await callSP(
    "CALL defaultdb.sp_cotizacion_admin_crear_v3(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
    // Traduce mensajes del SIGNAL del SP a errores mÃ¡s claros
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

// ===================== CREAR (PÃšBLICA/WEB) =====================
/**
 * Espera:
 * { lead: { nombre, celular, origen }, cotizacion: { tipoEvento, idTipoEvento, fechaEvento, lugar, horasEstimadas, mensaje } }
 * Retorna: { lead_id, cotizacion_id } segÃºn SP.
 */
async function createPublic({ lead, cotizacion }) {
  const fechaCreacion = getLimaDateTimeString();
  const params = [
    s(lead?.nombre),
    s(lead?.celular),
    s(lead?.origen ?? "Web"),
    s(cotizacion?.tipoEvento),
    n(cotizacion?.idTipoEvento),
    s(cotizacion?.fechaEvento),
    s(cotizacion?.lugar),
    n(cotizacion?.horasEstimadas),
    n(cotizacion?.dias),
    n(cotizacion?.viaticosMonto),
    s(cotizacion?.mensaje),
    fechaCreacion,
  ];
  const [rows0] = await callSP(
    "CALL defaultdb.sp_cotizacion_publica_crear(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    params
  );
  // SP retorna una fila con { lead_id, cotizacion_id }
  return rows0[0];
}

// ===================== ACTUALIZAR (ADMIN) =====================
/**
 * updateAdmin(id, { cotizacion?, items? })
 * - cotizacion: campos parciales (mismos nombres que createAdmin.cotizacion)
 * - items: reemplaza TODO el set si se envÃ­a (mismo formato que en createAdmin)
 */
async function updateAdmin(id, { cotizacion = {}, items, eventos } = {}) {
  const itemsMapped = Array.isArray(items)
    ? items.map((it) => ({
        idEventoServicio: it.idEventoServicio ?? it.exsId ?? null,
        eventoId: it.eventoId ?? null,
        servicioId: it.servicioId ?? null,
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

  const eventosMapped = Array.isArray(eventos)
    ? eventos
        .filter((evt) => evt && evt.fecha)
        .map((evt) => ({
          fecha: s(evt.fecha),
          hora: s(evt.hora),
          ubicacion: s(evt.ubicacion),
          direccion: s(evt.direccion),
          notas: s(evt.notas),
        }))
    : null;

  const params = [
    Number(id),
    s(cotizacion.tipoEvento ?? null),
    n(cotizacion.idTipoEvento ?? null),
    s(cotizacion.fechaEvento ?? null),
    s(cotizacion.lugar ?? null),
    n(cotizacion.horasEstimadas ?? null),
    n(cotizacion.dias ?? null),
    n(cotizacion.viaticosMonto ?? null),
    s(cotizacion.mensaje ?? null),
    s(cotizacion.estado ?? null),
    itemsMapped ? JSON.stringify(itemsMapped) : null,
    eventosMapped ? JSON.stringify(eventosMapped) : null,
  ];

  await callSP(
    "CALL defaultdb.sp_cotizacion_admin_actualizar(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    params
  );
  return { updated: true };
}

// ===================== REGLA DE NEGOCIO (VENCIMIENTO) =====================
async function getFechaYEstado(id) {
  const [rows] = await pool.query(
    `SELECT c.Cot_FechaEvento AS fechaEvento,
            ec.ECot_Nombre AS estado
     FROM T_Cotizacion c
     JOIN T_Estado_Cotizacion ec ON ec.PK_ECot_Cod = c.FK_ECot_Cod
     WHERE c.PK_Cot_Cod = ?`,
    [Number(id)]
  );
  return rows && rows[0] ? rows[0] : null;
}

async function rechazarVencidas(fechaCorte) {
  const fecha = fechaCorte || null;
  await pool.query(
    `UPDATE T_Cotizacion c
     JOIN T_Estado_Cotizacion ec_r ON ec_r.ECot_Nombre = 'Expirada'
     JOIN T_Estado_Cotizacion ec_b ON ec_b.ECot_Nombre = 'Borrador'
     JOIN T_Estado_Cotizacion ec_e ON ec_e.ECot_Nombre = 'Enviada'
     SET c.FK_ECot_Cod = ec_r.PK_ECot_Cod
     WHERE c.FK_ECot_Cod IN (ec_b.PK_ECot_Cod, ec_e.PK_ECot_Cod)
       AND (
         c.Cot_FechaEvento <= ?
         OR
         c.Cot_Fecha_Crea <= DATE_SUB(?, INTERVAL 90 DAY)
         OR (
           c.Cot_FechaEvento <= DATE_ADD(?, INTERVAL 7 DAY)
           AND NOT (DATEDIFF(c.Cot_FechaEvento, c.Cot_Fecha_Crea) BETWEEN 1 AND 7)
         )
       )`,
    [fecha, fecha, fecha]
  );
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
    "CALL defaultdb.sp_cotizacion_estado_actualizar(?,?,?)",
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

async function migrarAPedido({ cotizacionId, empleadoId, nombrePedido = null } = {}) {
  const conn = await pool.getConnection();
  try {
    const fechaCreacion = getLimaISODate();
    const params = [
      Number(cotizacionId),
      Number(empleadoId),
      nombrePedido != null ? String(nombrePedido) : null,
      fechaCreacion,
    ];

    await conn.query("SET @pedidoId = NULL");
    await conn.query(
      "CALL defaultdb.sp_cotizacion_convertir_a_pedido(?, ?, ?, ?, @pedidoId)",
      params
    );

    const [[row]] = await conn.query("SELECT @pedidoId AS pedidoId");
    const pedidoId = row?.pedidoId != null ? Number(row.pedidoId) : null;

    return { pedidoId };
  } finally {
    conn.release();
  }
}
module.exports = {
  listAll,
  findByIdWithItems, // usa SP JSON
  createAdmin, // usa SP crear_admin
  createPublic, // usa SP crear_publica
  updateAdmin, // usa SP actualizar_admin (reemplaza items si se pasan)
  listServiciosByCotizacionId,
  listServiciosFechasByCotizacionId,
  replaceServiciosFechas,
  getFechaYEstado,
  rechazarVencidas,
  deleteById,
  cambiarEstado,
  migrarAPedido,
};

