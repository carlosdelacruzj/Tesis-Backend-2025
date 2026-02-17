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

async function findPerfilesByUsuarioId(usuarioId) {
  if (!usuarioId) return [];

  const [rows] = await pool.query(
    `
      SELECT
        p.PK_Perf_Cod AS perfilId,
        p.Per_Codigo  AS perfilCodigo,
        p.Per_Nombre  AS perfilNombre,
        up.UP_Principal AS principal
      FROM T_UsuarioPerfil up
      INNER JOIN T_Perfil p ON p.PK_Perf_Cod = up.FK_Perf_Cod
      WHERE up.FK_U_Cod = ?
        AND COALESCE(up.UP_Activo, 1) = 1
        AND COALESCE(p.Per_Activo, 1) = 1
      ORDER BY up.UP_Principal DESC, p.Per_Codigo ASC
    `,
    [usuarioId]
  );

  return Array.isArray(rows) ? rows : [];
}

async function updatePasswordByCorreo(correo, hash, fechaUpd) {
  const email = normalizeEmail(correo);
  if (!email) return 0;

  const [result] = await pool.query(
    `
      UPDATE T_Usuario
      SET U_Contrasena = ?, U_Fecha_Upd = COALESCE(?, NOW())
      WHERE LOWER(U_Correo) = ?
    `,
    [hash, fechaUpd, email]
  );

  return result.affectedRows || 0;
}

module.exports = {
  findByCorreo,
  findPerfilesByUsuarioId,
  updatePasswordByCorreo,
};
