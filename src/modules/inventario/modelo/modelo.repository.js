// src/modules/inventario/modelo/modelo.repository.js
const pool = require("../../../db");

// Devuelve todos los modelos con sus marcas y tipos asociados.
async function findAll() {
  const [rows] = await pool.query(
    `SELECT
        m.PK_IMo_Cod AS idModelo,
        m.NMo_Nombre AS nombre,
        m.FK_IMa_Cod AS idMarca,
        ma.NMa_Nombre AS nombreMarca,
        m.FK_TE_Cod AS idTipoEquipo,
        te.TE_Nombre AS nombreTipoEquipo
      FROM T_Modelo m
      INNER JOIN T_Marca ma ON ma.PK_IMa_Cod = m.FK_IMa_Cod
      INNER JOIN T_Tipo_Equipo te ON te.PK_TE_Cod = m.FK_TE_Cod
      ORDER BY ma.NMa_Nombre ASC, m.NMo_Nombre ASC`
  );
  return rows;
}

// Busca un modelo por ID (o null si no existe).
async function findById(idModelo) {
  const [rows] = await pool.query(
    `SELECT
        m.PK_IMo_Cod AS idModelo,
        m.NMo_Nombre AS nombre,
        m.FK_IMa_Cod AS idMarca,
        ma.NMa_Nombre AS nombreMarca,
        m.FK_TE_Cod AS idTipoEquipo,
        te.TE_Nombre AS nombreTipoEquipo
      FROM T_Modelo m
      INNER JOIN T_Marca ma ON ma.PK_IMa_Cod = m.FK_IMa_Cod
      INNER JOIN T_Tipo_Equipo te ON te.PK_TE_Cod = m.FK_TE_Cod
      WHERE m.PK_IMo_Cod = ?`,
    [idModelo]
  );
  return rows[0] || null;
}

// Inserta un nuevo modelo y devuelve el registro guardado.
async function create({ nombre, idMarca, idTipoEquipo }) {
  const [result] = await pool.query(
    "INSERT INTO T_Modelo (NMo_Nombre, FK_IMa_Cod, FK_TE_Cod) VALUES (?, ?, ?)",
    [nombre, idMarca, idTipoEquipo]
  );
  return findById(result.insertId);
}

// Actualiza un modelo existente y devuelve el registro actualizado.
async function update(idModelo, { nombre, idMarca, idTipoEquipo }) {
  const [result] = await pool.query(
    "UPDATE T_Modelo SET NMo_Nombre = ?, FK_IMa_Cod = ?, FK_TE_Cod = ? WHERE PK_IMo_Cod = ?",
    [nombre, idMarca, idTipoEquipo, idModelo]
  );
  if (result.affectedRows === 0) {
    return null;
  }
  return findById(idModelo);
}

// Elimina un modelo (retorna true si alguna fila fue borrada).
async function remove(idModelo) {
  const [result] = await pool.query("DELETE FROM T_Modelo WHERE PK_IMo_Cod = ?", [idModelo]);
  return result.affectedRows > 0;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};
