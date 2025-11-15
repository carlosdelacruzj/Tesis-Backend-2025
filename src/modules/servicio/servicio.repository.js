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

// Lecturas
async function getAll() {
  // SP existente: devuelve { id, nombre }
  return runCall("CALL sp_servicio_listar()");
}

async function getById(id) {
  const result = await runQuery(
    `SELECT PK_S_Cod AS id, S_Nombre AS nombre
     FROM T_Servicios
     WHERE PK_S_Cod = ?
     LIMIT 1`,
    [Number(id)]
  );

  // Normaliza según cómo responda runQuery:
  // - Si runQuery => rows          -> result es array de filas
  // - Si runQuery => [rows, fields] -> result[0] es array de filas
  const rows = Array.isArray(result)
    ? (Array.isArray(result[0]) ? result[0] : result)
    : [];

  return rows[0] || null;   // ← objeto o null
}

// Escrituras
async function create({ nombre }) {
  await runQuery("INSERT INTO T_Servicios (S_Nombre) VALUES (?)", [t(nombre)]);
}

async function updateById({ idServicio, nombre }) {
  await runQuery(
    "UPDATE T_Servicios SET S_Nombre = ? WHERE PK_S_Cod = ?",
    [t(nombre), Number(idServicio)]
  );
}

module.exports = { getAll, getById, create, updateById };
