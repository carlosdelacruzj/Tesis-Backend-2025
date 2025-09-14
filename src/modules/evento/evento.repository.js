// src/modules/evento/evento.repository.js
const pool = require("../../db");

// Para CALL (SP): devuelve primer recordset
async function runCall(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
}

// Para SQL normal
async function runQuery(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

const t = (v) => (typeof v === "string" ? v.trim() : v ?? null);

// ===== Lecturas =====
async function getAll() {
  // SP existente: devuelve lista de eventos
  return runCall("CALL SP_getAllEventos()");
}

async function getById(id) {
  const result = await runQuery(
    `SELECT PK_E_Cod AS id, E_Nombre AS nombre
     FROM T_Eventos
     WHERE PK_E_Cod = ?
     LIMIT 1`,
    [Number(id)]
  );

  // Normaliza según responda mysql/mysql2:
  // - runQuery => rows (array de objetos)
  // - (por compatibilidad) si viniera [rows, fields] -> result[0]
  const rows = Array.isArray(result)
    ? (Array.isArray(result[0]) ? result[0] : result)
    : [];

  return rows[0] || null; // ← objeto o null
}

// ===== Escrituras =====
async function create({ nombre }) {
  await runQuery(
    "INSERT INTO T_Eventos (E_Nombre) VALUES (?)",
    [t(nombre)]
  );
}

async function updateById({ idEvento, nombre }) {
  await runQuery(
    "UPDATE T_Eventos SET E_Nombre = ? WHERE PK_E_Cod = ?",
    [t(nombre), Number(idEvento)]
  );
}

module.exports = { getAll, getById, create, updateById };
