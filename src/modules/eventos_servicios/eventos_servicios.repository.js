const pool = require("../../db");

// Ejecuta un CALL y devuelve el primer recordset en forma de arreglo
async function runCall(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
}

const trimOrNull = (value) =>
  typeof value === "string" ? value.trim() || null : value ?? null;

const isNullishOrBlank = (value) =>
  value == null || (typeof value === "string" && value.trim() === "");

function parseJSONColumn(raw, fallback = []) {
  if (raw == null) return Array.isArray(fallback) ? fallback : [];
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : Array.isArray(fallback) ? fallback : [];
  } catch {
    return Array.isArray(fallback) ? fallback : [];
  }
}

function normalizeStaff(detalle = [], fallbackTotal = null) {
  const detalleNorm = detalle.map((item = {}) => ({
    rol: item?.rol ?? null,
    cantidad:
      item?.cantidad != null && Number.isFinite(Number(item.cantidad))
        ? Number(item.cantidad)
        : 0,
  }));

  const total = fallbackTotal != null && Number.isFinite(Number(fallbackTotal))
    ? Number(fallbackTotal)
    : detalleNorm.reduce((acc, item) => acc + (item.cantidad || 0), 0);

  return { total, detalle: detalleNorm };
}

function normalizeRow(row = {}) {
  const staffDetalle = parseJSONColumn(row.staffDetalle);
  const equiposDetalle = parseJSONColumn(row.equipos).map((eq = {}) => ({
    tipoEquipoId:
      eq?.tipoEquipoId != null && Number.isFinite(Number(eq.tipoEquipoId))
        ? Number(eq.tipoEquipoId)
        : null,
    tipoEquipo: eq?.tipoEquipo ?? null,
    cantidad:
      eq?.cantidad != null && Number.isFinite(Number(eq.cantidad))
        ? Number(eq.cantidad)
        : null,
    notas: eq?.notas ?? null,
  }));

  return {
    id: row.idEventoServicio ?? row.id ?? null,
    titulo: row.titulo ?? row.ExS_Titulo ?? null,
    categoriaId:
      row.categoriaId != null
        ? Number(row.categoriaId)
        : row.FK_ESC_Cod != null
        ? Number(row.FK_ESC_Cod)
        : null,
    categoriaNombre: row.categoriaNombre ?? row.ESC_Nombre ?? null,
    categoriaTipo: row.categoriaTipo ?? row.ESC_Tipo ?? null,
    esAddon: row.esAddon != null
      ? Boolean(row.esAddon)
      : row.ExS_EsAddon != null
      ? Boolean(row.ExS_EsAddon)
      : false,
    evento: {
      id: row.idEvento ?? row.PK_E_Cod ?? null,
      nombre: row.evento ?? row.E_Nombre ?? null,
    },
    servicio: {
      id: row.idServicio ?? row.PK_S_Cod ?? null,
      nombre: row.servicio ?? row.S_Nombre ?? null,
    },
    precio:
      row.precio != null && Number.isFinite(Number(row.precio))
        ? Number(row.precio)
        : null,
    descripcion: row.descripcion ?? row.ExS_Descripcion ?? null,
    horas:
      row.horas != null && Number.isFinite(Number(row.horas))
        ? Number(row.horas)
        : null,
    fotosImpresas:
      row.fotosImpresas != null && Number.isFinite(Number(row.fotosImpresas))
        ? Number(row.fotosImpresas)
        : null,
    trailerMin:
      row.trailerMin != null && Number.isFinite(Number(row.trailerMin))
        ? Number(row.trailerMin)
        : null,
    filmMin:
      row.filmMin != null && Number.isFinite(Number(row.filmMin))
        ? Number(row.filmMin)
        : null,
    estado: {
      id:
        row.estadoId != null
          ? Number(row.estadoId)
          : row.FK_ESE_Cod != null
          ? Number(row.FK_ESE_Cod)
          : null,
      nombre:
        row.estadoNombre ??
        row.ESE_Nombre ??
        null,
    },
    staff: normalizeStaff(staffDetalle, row.staffTotal),
    equipos: equiposDetalle,
  };
}

function toStaffJSON(staff = [], allowEmpty = false) {
  if (!Array.isArray(staff) || staff.length === 0) {
    return allowEmpty && Array.isArray(staff) ? "[]" : null;
  }
  const cleaned = staff
    .map((item = {}) => ({
      rol: typeof item.rol === "string" ? item.rol.trim() : null,
      cantidad:
        item.cantidad != null && Number.isFinite(Number(item.cantidad))
          ? Number(item.cantidad)
          : 0,
    }))
    .filter((item) => item.rol);
  if (cleaned.length) return JSON.stringify(cleaned);
  return allowEmpty ? "[]" : null;
}

function toEquiposJSON(equipos = [], allowEmpty = false) {
  if (!Array.isArray(equipos) || equipos.length === 0) {
    return allowEmpty && Array.isArray(equipos) ? "[]" : null;
  }
  const cleaned = equipos
    .map((item = {}) => ({
      tipoEquipoId:
        item.tipoEquipoId != null && Number.isFinite(Number(item.tipoEquipoId))
          ? Number(item.tipoEquipoId)
          : null,
      cantidad:
        item.cantidad != null && Number.isFinite(Number(item.cantidad))
          ? Number(item.cantidad)
          : 1,
      notas:
        typeof item.notas === "string" && item.notas.trim()
          ? item.notas.trim()
          : null,
    }))
    .filter((item) => item.tipoEquipoId != null);
  if (cleaned.length) return JSON.stringify(cleaned);
  return allowEmpty ? "[]" : null;
}

// Listado con filtros (usa el SP con filtros opcionales)
async function getAll({ evento = null, servicio = null } = {}) {
  const pEvento =
    evento != null && String(evento).trim() !== "" ? Number(evento) : null;
  const pServicio =
    servicio != null && String(servicio).trim() !== "" ? Number(servicio) : null;

  const rows = await runCall("CALL sp_evento_servicio_listar(?, ?)", [
    pEvento,
    pServicio,
  ]);

  return Array.isArray(rows) ? rows.map((row) => normalizeRow(row)) : [];
}

// Detalle por id (PK_ExS_Cod)
async function getById(id) {
  const rows = await runCall("CALL sp_evento_servicio_obtener(?)", [Number(id)]);
  if (!Array.isArray(rows) || rows.length === 0) return [];
  if (rows.length === 1) return [normalizeRow(rows[0])];
  return rows.map((row) => normalizeRow(row));
}

// Crear un evento-servicio (paquete)
async function create({
  servicio,
  evento,
  categoriaId,
  esAddon,
  precio,
  descripcion,
  titulo,
  horas,
  fotosImpresas,
  trailerMin,
  filmMin,
  staff,
  equipos,
}) {
  const params = [
    Number(servicio),
    Number(evento),
    isNullishOrBlank(categoriaId) ? null : Number(categoriaId),
    esAddon == null ? null : Number(esAddon ? 1 : 0),
    isNullishOrBlank(precio) ? null : Number(precio),
    trimOrNull(descripcion),
    trimOrNull(titulo),
    isNullishOrBlank(horas) ? null : Number(horas),
    isNullishOrBlank(fotosImpresas) ? null : Number(fotosImpresas),
    isNullishOrBlank(trailerMin) ? null : Number(trailerMin),
    isNullishOrBlank(filmMin) ? null : Number(filmMin),
    toStaffJSON(staff),
    toEquiposJSON(equipos),
  ];

  const rs = await runCall(
    "CALL sp_evento_servicio_crear(?,?,?,?,?,?,?,?,?,?,?,?,?)",
    params
  );

  const insertedId =
    Array.isArray(rs) && rs[0] && rs[0].PK_ExS_Cod != null ? rs[0].PK_ExS_Cod : undefined;

  return { insertedId };
}

// Actualizar un evento-servicio
async function updateById({
  id,
  servicio,
  evento,
  categoriaId,
  esAddon,
  precio,
  descripcion,
  titulo,
  horas,
  fotosImpresas,
  trailerMin,
  filmMin,
  staff,
  equipos,
}) {
  const params = [
    Number(id),
    isNullishOrBlank(servicio) ? null : Number(servicio),
    isNullishOrBlank(evento) ? null : Number(evento),
    isNullishOrBlank(categoriaId) ? null : Number(categoriaId),
    esAddon == null ? null : Number(esAddon ? 1 : 0),
    isNullishOrBlank(precio) ? null : Number(precio),
    trimOrNull(descripcion),
    trimOrNull(titulo),
    isNullishOrBlank(horas) ? null : Number(horas),
    isNullishOrBlank(fotosImpresas) ? null : Number(fotosImpresas),
    isNullishOrBlank(trailerMin) ? null : Number(trailerMin),
    isNullishOrBlank(filmMin) ? null : Number(filmMin),
    staff === undefined ? null : toStaffJSON(staff, true),
    equipos === undefined ? null : toEquiposJSON(equipos, true),
  ];

  await runCall(
    "CALL sp_evento_servicio_actualizar(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    params
  );
}

async function updateEstado(id, estadoId) {
  const [result] = await pool.query(
    "UPDATE T_EventoServicio SET FK_ESE_Cod = ? WHERE PK_ExS_Cod = ?",
    [estadoId, id]
  );
  return result.affectedRows > 0;
}

async function listEstados() {
  const [rows] = await pool.query(
    `SELECT PK_ESE_Cod AS idEstado, ESE_Nombre AS nombreEstado
     FROM T_EventoServicioEstado
     ORDER BY PK_ESE_Cod`
  );
  return rows;
}

async function listCategorias() {
  const [rows] = await pool.query(
    `SELECT
       PK_ESC_Cod AS id,
       ESC_Nombre AS nombre,
       ESC_Tipo AS tipo
     FROM T_EventoServicioCategoria
     WHERE ESC_Activo = 1
     ORDER BY ESC_Tipo, ESC_Nombre`
  );
  return rows;
}

module.exports = {
  getAll,
  getById,
  create,
  updateById,
  listCategorias,
  updateEstado,
  listEstados,
};
