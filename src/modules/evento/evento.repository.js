// src/modules/evento/evento.repository.js
const pool = require("../../db");

async function runCall(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
}

async function runQuery(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

const t = (value) =>
  typeof value === "string" ? value.trim() || null : value ?? null;

async function getAll() {
  return runCall("CALL sp_evento_listar()");
}

async function getById(id) {
  const rows = await runQuery(
    `SELECT
        PK_E_Cod AS id,
        E_Nombre AS nombre,
        E_IconUrl AS iconUrl,
        E_FormSchema AS formSchema
     FROM T_Eventos
     WHERE PK_E_Cod = ?
     LIMIT 1`,
    [Number(id)]
  );

  if (Array.isArray(rows)) {
    return rows[0] || null;
  }
  return rows ?? null;
}

async function create({ nombre, iconUrl }) {
  return runQuery(
    "INSERT INTO T_Eventos (E_Nombre, E_IconUrl) VALUES (?, ?)",
    [t(nombre), t(iconUrl)]
  );
}

async function createWithSchema({ nombre, iconUrl, formSchema }) {
  return runQuery(
    "INSERT INTO T_Eventos (E_Nombre, E_IconUrl, E_FormSchema) VALUES (?, ?, ?)",
    [t(nombre), t(iconUrl), formSchema ?? null]
  );
}

async function updateById({ idEvento, nombre, iconUrl, formSchema }) {
  const fields = [];
  const params = [];

  if (nombre !== undefined) {
    fields.push("E_Nombre = ?");
    params.push(t(nombre));
  }
  if (iconUrl !== undefined) {
    fields.push("E_IconUrl = ?");
    params.push(t(iconUrl));
  }
  if (formSchema !== undefined) {
    fields.push("E_FormSchema = ?");
    params.push(formSchema);
  }

  if (!fields.length) return { affectedRows: 0 };

  params.push(Number(idEvento));

  const sql = `UPDATE T_Eventos SET ${fields.join(", ")} WHERE PK_E_Cod = ?`;
  return runQuery(sql, params);
}

async function getSchemaById(id) {
  const rows = await runQuery(
    `SELECT
        PK_E_Cod AS id,
        E_FormSchema AS formSchema
     FROM T_Eventos
     WHERE PK_E_Cod = ?
     LIMIT 1`,
    [Number(id)]
  );
  if (Array.isArray(rows)) return rows[0] || null;
  return rows ?? null;
}

async function updateSchemaById({ idEvento, formSchema }) {
  return runQuery(
    `UPDATE T_Eventos
     SET E_FormSchema = ?
     WHERE PK_E_Cod = ?`,
    [formSchema, Number(idEvento)]
  );
}

module.exports = {
  getAll,
  getById,
  create,
  createWithSchema,
  updateById,
  getSchemaById,
  updateSchemaById,
};
