// src/modules/inventario/equipo/equipo.repository.js
const pool = require("../../../db");

// Estado 'De baja' (no se contabiliza en resúmenes)
const ESTADO_BAJA_ID = 13;
const ESTADO_DISPONIBLE_ID = 10;

const baseSelect = `SELECT
    e.PK_Eq_Cod AS idEquipo,
    e.Eq_Fecha_Ingreso AS fechaIngreso,
    e.FK_IMo_Cod AS idModelo,
    mo.NMo_Nombre AS nombreModelo,
    mo.FK_IMa_Cod AS idMarca,
    ma.NMa_Nombre AS nombreMarca,
    mo.FK_TE_Cod AS idTipoEquipo,
    te.TE_Nombre AS nombreTipoEquipo,
    e.FK_EE_Cod AS idEstado,
    ee.EE_Nombre AS nombreEstado,
    e.Eq_Serie AS serie
  FROM T_Equipo e
  INNER JOIN T_Modelo mo ON mo.PK_IMo_Cod = e.FK_IMo_Cod
  INNER JOIN T_Marca ma ON ma.PK_IMa_Cod = mo.FK_IMa_Cod
  INNER JOIN T_Tipo_Equipo te ON te.PK_TE_Cod = mo.FK_TE_Cod
  INNER JOIN T_Estado_Equipo ee ON ee.PK_EE_Cod = e.FK_EE_Cod`;

async function findAll() {
  const [rows] = await pool.query(`${baseSelect} ORDER BY e.PK_Eq_Cod DESC`);
  return rows;
}

async function findByFilters({ idTipoEquipo, idMarca, idModelo }) {
  const clauses = [];
  const params = [];

  if (idTipoEquipo != null) {
    clauses.push("mo.FK_TE_Cod = ?");
    params.push(idTipoEquipo);
  }
  if (idMarca != null) {
    clauses.push("mo.FK_IMa_Cod = ?");
    params.push(idMarca);
  }
  if (idModelo != null) {
    clauses.push("e.FK_IMo_Cod = ?");
    params.push(idModelo);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const [rows] = await pool.query(
    `${baseSelect} ${where} ORDER BY e.PK_Eq_Cod DESC`,
    params
  );
  return rows;
}

async function findById(idEquipo) {
  const [rows] = await pool.query(`${baseSelect} WHERE e.PK_Eq_Cod = ?`, [idEquipo]);
  return rows[0] || null;
}

async function create({ fechaIngreso, idModelo, idEstado, serie }) {
  const [result] = await pool.query(
    `INSERT INTO T_Equipo (Eq_Fecha_Ingreso, FK_IMo_Cod, FK_EE_Cod, Eq_Serie)
     VALUES (?, ?, ?, ?)`,
    [fechaIngreso ?? null, idModelo, idEstado, serie ?? null]
  );
  return findById(result.insertId);
}

async function update(idEquipo, { fechaIngreso, idModelo, idEstado, serie }) {
  const [result] = await pool.query(
    `UPDATE T_Equipo
     SET Eq_Fecha_Ingreso = ?, FK_IMo_Cod = ?, FK_EE_Cod = ?, Eq_Serie = ?
     WHERE PK_Eq_Cod = ?`,
    [fechaIngreso ?? null, idModelo, idEstado, serie ?? null, idEquipo]
  );
  if (result.affectedRows === 0) {
    return null;
  }
  return findById(idEquipo);
}

async function remove(idEquipo) {
  const [result] = await pool.query("DELETE FROM T_Equipo WHERE PK_Eq_Cod = ?", [idEquipo]);
  return result.affectedRows > 0;
}

async function updateEstado(idEquipo, idEstado) {
  const [result] = await pool.query(
    `UPDATE T_Equipo
     SET FK_EE_Cod = ?
     WHERE PK_Eq_Cod = ?`,
    [idEstado, idEquipo]
  );
  if (result.affectedRows === 0) {
    return null;
  }
  return findById(idEquipo);
}

// Cambia estado a inhabilitado y limpia asignaciones futuras del equipo
async function inhabilitarEquipo(idEquipo, idEstado, fechaHoy, proyectoExcluidoId = null) {
  const [rows] = await pool.query("CALL sp_equipo_inhabilitar(?,?,?,?)", [
    idEquipo,
    idEstado,
    fechaHoy,
    proyectoExcluidoId == null ? null : Number(proyectoExcluidoId),
  ]);
  const proyectosAfectados =
    Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : [];
  const equipo = await findById(idEquipo);
  return { equipo, proyectosAfectados };
}

async function listProyectosAfectados(idEquipo, fechaDesde) {
  const [rows] = await pool.query("CALL sp_equipo_proyectos_afectados(?,?)", [
    idEquipo,
    fechaDesde,
  ]);
  return Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : [];
}

async function summarizeByModel() {
  const [rows] = await pool.query(
    `SELECT
       te.PK_TE_Cod AS idTipoEquipo,
       te.TE_Nombre AS nombreTipoEquipo,
       ma.PK_IMa_Cod AS idMarca,
       ma.NMa_Nombre AS nombreMarca,
       mo.PK_IMo_Cod AS idModelo,
       mo.NMo_Nombre AS nombreModelo,
       COUNT(e.PK_Eq_Cod) AS cantidad,
       CAST(SUM(CASE WHEN e.FK_EE_Cod = ? THEN 1 ELSE 0 END) AS UNSIGNED) AS disponibles
     FROM T_Tipo_Equipo te
     LEFT JOIN T_Modelo mo ON mo.FK_TE_Cod = te.PK_TE_Cod
     LEFT JOIN T_Marca ma ON ma.PK_IMa_Cod = mo.FK_IMa_Cod
     LEFT JOIN T_Equipo e
            ON e.FK_IMo_Cod = mo.PK_IMo_Cod
           AND e.FK_EE_Cod <> ?
     GROUP BY
       te.PK_TE_Cod,
       te.TE_Nombre,
       ma.PK_IMa_Cod,
       ma.NMa_Nombre,
       mo.PK_IMo_Cod,
       mo.NMo_Nombre
     ORDER BY te.TE_Nombre, ma.NMa_Nombre, mo.NMo_Nombre`,
    [ESTADO_DISPONIBLE_ID, ESTADO_BAJA_ID]
  );
  return rows;
}

async function findEstados() {
  const [rows] = await pool.query(
    `SELECT
       PK_EE_Cod AS idEstado,
       EE_Nombre AS nombreEstado
     FROM T_Estado_Equipo
     ORDER BY EE_Nombre`
  );
  return rows;
}

module.exports = {
  findAll,
  findByFilters,
  findById,
  create,
  update,
  remove,
  updateEstado,
  inhabilitarEquipo,
  listProyectosAfectados,
  summarizeByModel,
  findEstados,
};
