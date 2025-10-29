const pool = require("../../db");

const normalizeEmail = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : null;

async function findByCorreo(correo) {
  const email = normalizeEmail(correo);
  if (!email) return null;

  const [rows] = await pool.query(
    `
      SELECT
        u.PK_U_Cod      AS usuarioId,
        u.U_Correo      AS correo,
        u.U_Contrasena  AS contrasenaHash,
        u.U_Nombre      AS nombres,
        u.U_Apellido    AS apellidos,
        c.PK_Cli_Cod    AS clienteId,
        e.PK_Em_Cod     AS empleadoId,
        te.TiEm_Cargo   AS tipoEmpleado,
        te.TiEm_PermiteLogin AS permiteLogin
      FROM T_Usuario u
      LEFT JOIN T_Cliente c ON c.FK_U_Cod = u.PK_U_Cod
      LEFT JOIN T_Empleados e ON e.FK_U_Cod = u.PK_U_Cod
      LEFT JOIN T_Tipo_Empleado te ON te.PK_Tipo_Emp_Cod = e.FK_Tipo_Emp_Cod
      WHERE LOWER(u.U_Correo) = ?
      LIMIT 1
    `,
    [email]
  );

  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

async function updatePasswordByCorreo(correo, hash) {
  const email = normalizeEmail(correo);
  if (!email) return 0;

  const [result] = await pool.query(
    `
      UPDATE T_Usuario
      SET U_Contrasena = ?, U_Fecha_Upd = NOW()
      WHERE LOWER(U_Correo) = ?
    `,
    [hash, email]
  );

  return result.affectedRows || 0;
}

module.exports = {
  findByCorreo,
  updatePasswordByCorreo,
};
