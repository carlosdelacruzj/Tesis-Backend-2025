// src/modules/inventario/marca/marca.repository.js
const pool = require("../../../db");

// Devuelve todas las marcas ordenadas alfabeticamente.
async function findAll() {
  const [rows] = await pool.query(
    "SELECT PK_IMa_Cod AS idMarca, NMa_Nombre AS nombre FROM T_Marca ORDER BY NMa_Nombre ASC"
  );
  return rows;
}

// Busca una marca por ID (o null si no existe).
async function findById(idMarca) {
  const [rows] = await pool.query(
    "SELECT PK_IMa_Cod AS idMarca, NMa_Nombre AS nombre FROM T_Marca WHERE PK_IMa_Cod = ?",
    [idMarca]
  );
  return rows[0] || null;
}

// Inserta una nueva marca y devuelve el registro creado.
async function create({ nombre }) {
  const [result] = await pool.query(
    "INSERT INTO T_Marca (NMa_Nombre) VALUES (?)",
    [nombre]
  );
  const created = await findById(result.insertId);
  return created;
}

// Actualiza el nombre de una marca existente y devuelve el registro actualizado.
async function update(idMarca, { nombre }) {
  const [result] = await pool.query(
    "UPDATE T_Marca SET NMa_Nombre = ? WHERE PK_IMa_Cod = ?",
    [nombre, idMarca]
  );
  if (result.affectedRows === 0) {
    return null;
  }
  return findById(idMarca);
}

// Elimina una marca (devuelve true si se borro alguna fila).
async function remove(idMarca) {
  const [result] = await pool.query("DELETE FROM T_Marca WHERE PK_IMa_Cod = ?", [idMarca]);
  return result.affectedRows > 0;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};
