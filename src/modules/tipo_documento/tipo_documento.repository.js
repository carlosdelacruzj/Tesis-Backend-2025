const pool = require("../../db");

async function listAll() {
  const [rows] = await pool.query(
    `SELECT
       PK_TD_Cod   AS id,
       TD_Codigo   AS codigo,
       TD_Nombre   AS nombre,
       TD_TipoDato AS tipoDato,
       TD_TamMin   AS tamMin,
       TD_TamMax   AS tamMax,
       TD_Activo   AS activo
     FROM T_TipoDocumento
     ORDER BY PK_TD_Cod`
  );
  return rows;
}

module.exports = { listAll };
