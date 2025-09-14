const pool = require("../../db");

// CALL → primer recordset
async function runCall(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
}

const t = (v) => (typeof v === "string" ? v.trim() : v ?? null);

// Listado con filtros (usa el SP de 2 parámetros: evento & servicio)
async function getAll({ evento = null, servicio = null } = {}) {
  const pEvento = evento != null && String(evento).trim() !== "" ? Number(evento) : null;
  const pServ   = servicio != null && String(servicio).trim() !== "" ? Number(servicio) : null;
  return runCall("CALL SP_getAllServiciosByEventoServ(?, ?)", [pEvento, pServ]);
}

// Detalle por id (PK_ExS_Cod)
async function getById(id) {
  return runCall("CALL SP_getEventoxServicioById(?)", [Number(id)]);
}

// Crear
async function create({ servicio, evento, precio, descripcion, titulo }) {
  const pServ = Number(servicio);
  const pEvt  = Number(evento);
  const pPrec = precio == null || String(precio).trim() === "" ? null : Number(precio);
  const pDesc = t(descripcion);
  const pTit  = t(titulo);

  const rs = await runCall("CALL SP_postEventoxServicio(?,?,?,?,?)", [
    pServ, pEvt, pPrec, pDesc, pTit,
  ]);

  // Muchos SP devuelven el nuevo ID como primer row con PK_ExS_Cod
  const insertedId = Array.isArray(rs) && rs[0] && rs[0].PK_ExS_Cod != null
    ? rs[0].PK_ExS_Cod
    : undefined;

  return { insertedId };
}

// Actualizar (firma según tu SP: servicio, precio, concepto, id)
async function updateById({ id, servicio, precio, concepto }) {
  const pId   = Number(id);
  const pServ = servicio == null || String(servicio).trim() === "" ? null : Number(servicio);
  const pPrec = precio   == null || String(precio).trim()   === "" ? null : Number(precio);
  const pConc = concepto == null || String(concepto).trim() === "" ? null : String(concepto);

  await runCall("CALL SP_putByIdEventoxServicio(?,?,?,?)", [pServ, pPrec, pConc, pId]);
}

module.exports = { getAll, getById, create, updateById };
