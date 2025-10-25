// src/modules/inventario/tipo-equipo/tipo-equipo.repository.js
const pool = require("../../../db");

// Devuelve todos los tipos de equipo ordenados alfabeticamente.
async function findAll() {
  const [rows] = await pool.query(
    "SELECT PK_TE_Cod AS idTipoEquipo, TE_Nombre AS nombre FROM T_Tipo_Equipo ORDER BY TE_Nombre ASC"
  );
  return rows;
}

// Busca un tipo de equipo por ID (o null si no existe).
async function findById(idTipoEquipo) {
  const [rows] = await pool.query(
    "SELECT PK_TE_Cod AS idTipoEquipo, TE_Nombre AS nombre FROM T_Tipo_Equipo WHERE PK_TE_Cod = ?",
    [idTipoEquipo]
  );
  return rows[0] || null;
}

// Crea un nuevo tipo de equipo y devuelve el registro persistido.
async function create({ nombre }) {
  const [result] = await pool.query(
    "INSERT INTO T_Tipo_Equipo (TE_Nombre) VALUES (?)",
    [nombre]
  );
  return findById(result.insertId);
}

// Actualiza el nombre de un tipo de equipo existente y devuelve el registro actualizado.
async function update(idTipoEquipo, { nombre }) {
  const [result] = await pool.query(
    "UPDATE T_Tipo_Equipo SET TE_Nombre = ? WHERE PK_TE_Cod = ?",
    [nombre, idTipoEquipo]
  );
  if (result.affectedRows === 0) {
    return null;
  }
  return findById(idTipoEquipo);
}

// Elimina un tipo de equipo (retorna true si se borro alguna fila).
async function remove(idTipoEquipo) {
  const [result] = await pool.query("DELETE FROM T_Tipo_Equipo WHERE PK_TE_Cod = ?", [idTipoEquipo]);
  return result.affectedRows > 0;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};
