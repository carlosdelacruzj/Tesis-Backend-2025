const pool = require("../../db");

async function listPerfiles() {
  const [rows] = await pool.query(
    `SELECT
       PK_Perf_Cod AS idPerfil,
       Per_Codigo  AS codigo,
       Per_Nombre  AS nombre,
       Per_Descripcion AS descripcion,
       Per_Activo  AS activo
     FROM T_Perfil
     ORDER BY Per_Codigo`
  );
  return rows || [];
}

async function createPerfil({ codigo, nombre, descripcion = null, activo = 1 }) {
  const [result] = await pool.query(
    `INSERT INTO T_Perfil (Per_Codigo, Per_Nombre, Per_Descripcion, Per_Activo)
     VALUES (?, ?, ?, ?)`,
    [codigo, nombre, descripcion, activo ? 1 : 0]
  );
  return Number(result.insertId);
}

async function updatePerfilById(perfilId, { nombre, descripcion = null }) {
  const [result] = await pool.query(
    `UPDATE T_Perfil
     SET Per_Nombre = ?, Per_Descripcion = ?
     WHERE PK_Perf_Cod = ?`,
    [nombre, descripcion, Number(perfilId)]
  );
  return Number(result.affectedRows || 0);
}

async function setPerfilEstadoById(perfilId, activo) {
  const [result] = await pool.query(
    `UPDATE T_Perfil
     SET Per_Activo = ?
     WHERE PK_Perf_Cod = ?`,
    [activo ? 1 : 0, Number(perfilId)]
  );
  return Number(result.affectedRows || 0);
}

async function getUsuarioById(usuarioId) {
  const [rows] = await pool.query(
    `SELECT PK_U_Cod AS usuarioId, U_Correo AS correo
     FROM T_Usuario
     WHERE PK_U_Cod = ?
     LIMIT 1`,
    [Number(usuarioId)]
  );
  return rows?.[0] || null;
}

async function getPerfilByCodigo(perfilCodigo) {
  const [rows] = await pool.query(
    `SELECT
       PK_Perf_Cod AS idPerfil,
       Per_Codigo AS codigo,
       Per_Nombre AS nombre,
       Per_Activo AS activo
     FROM T_Perfil
     WHERE UPPER(TRIM(Per_Codigo)) = UPPER(TRIM(?))
     LIMIT 1`,
    [perfilCodigo]
  );
  return rows?.[0] || null;
}

async function getPerfilById(perfilId) {
  const [rows] = await pool.query(
    `SELECT
       PK_Perf_Cod AS idPerfil,
       Per_Codigo AS codigo,
       Per_Nombre AS nombre,
       Per_Activo AS activo
     FROM T_Perfil
     WHERE PK_Perf_Cod = ?
     LIMIT 1`,
    [Number(perfilId)]
  );
  return rows?.[0] || null;
}

async function listPerfilesByUsuario(usuarioId) {
  const [rows] = await pool.query(
    `SELECT
       p.PK_Perf_Cod AS idPerfil,
       p.Per_Codigo  AS codigo,
       p.Per_Nombre  AS nombre,
       up.UP_Principal AS principal,
       up.UP_Activo  AS activo
     FROM T_UsuarioPerfil up
     JOIN T_Perfil p ON p.PK_Perf_Cod = up.FK_Perf_Cod
     WHERE up.FK_U_Cod = ?
     ORDER BY up.UP_Activo DESC, up.UP_Principal DESC, p.Per_Codigo`,
    [Number(usuarioId)]
  );
  return rows || [];
}

async function countPerfilesActivosByUsuario(conn, usuarioId) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS total
     FROM T_UsuarioPerfil
     WHERE FK_U_Cod = ?
       AND COALESCE(UP_Activo, 1) = 1`,
    [Number(usuarioId)]
  );
  return Number(rows?.[0]?.total || 0);
}

async function upsertUsuarioPerfil({ usuarioId, perfilId, principal = false }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    if (principal) {
      await conn.query(
        `UPDATE T_UsuarioPerfil
         SET UP_Principal = 0
         WHERE FK_U_Cod = ?
           AND COALESCE(UP_Activo, 1) = 1`,
        [Number(usuarioId)]
      );
    }

    await conn.query(
      `INSERT INTO T_UsuarioPerfil (FK_U_Cod, FK_Perf_Cod, UP_Principal, UP_Activo)
       VALUES (?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE
         UP_Activo = 1,
         UP_Principal = VALUES(UP_Principal)`,
      [Number(usuarioId), Number(perfilId), principal ? 1 : 0]
    );

    const totalActivos = await countPerfilesActivosByUsuario(conn, usuarioId);
    if (totalActivos > 0) {
      const [hasPrincipalRows] = await conn.query(
        `SELECT COUNT(*) AS total
         FROM T_UsuarioPerfil
         WHERE FK_U_Cod = ?
           AND COALESCE(UP_Activo, 1) = 1
           AND COALESCE(UP_Principal, 0) = 1`,
        [Number(usuarioId)]
      );
      const hasPrincipal = Number(hasPrincipalRows?.[0]?.total || 0) > 0;
      if (!hasPrincipal) {
        await conn.query(
          `UPDATE T_UsuarioPerfil
           SET UP_Principal = 1
           WHERE FK_U_Cod = ?
             AND FK_Perf_Cod = ?`,
          [Number(usuarioId), Number(perfilId)]
        );
      }
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function deactivateUsuarioPerfil({ usuarioId, perfilId }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const totalActivosAntes = await countPerfilesActivosByUsuario(conn, usuarioId);
    if (totalActivosAntes <= 1) {
      const err = new Error("No se puede quitar el ultimo perfil activo del usuario");
      err.status = 400;
      throw err;
    }

    const [result] = await conn.query(
      `UPDATE T_UsuarioPerfil
       SET UP_Activo = 0, UP_Principal = 0
       WHERE FK_U_Cod = ?
         AND FK_Perf_Cod = ?
         AND COALESCE(UP_Activo, 1) = 1`,
      [Number(usuarioId), Number(perfilId)]
    );

    if (!result?.affectedRows) {
      const err = new Error("El perfil no esta asignado de forma activa al usuario");
      err.status = 404;
      throw err;
    }

    const [hasPrincipalRows] = await conn.query(
      `SELECT COUNT(*) AS total
       FROM T_UsuarioPerfil
       WHERE FK_U_Cod = ?
         AND COALESCE(UP_Activo, 1) = 1
         AND COALESCE(UP_Principal, 0) = 1`,
      [Number(usuarioId)]
    );
    const hasPrincipal = Number(hasPrincipalRows?.[0]?.total || 0) > 0;

    if (!hasPrincipal) {
      await conn.query(
        `UPDATE T_UsuarioPerfil
         SET UP_Principal = 1
         WHERE PK_UPerf_Cod = (
           SELECT id FROM (
             SELECT PK_UPerf_Cod AS id
             FROM T_UsuarioPerfil
             WHERE FK_U_Cod = ?
               AND COALESCE(UP_Activo, 1) = 1
             ORDER BY PK_UPerf_Cod
             LIMIT 1
           ) x
         )`,
        [Number(usuarioId)]
      );
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = {
  listPerfiles,
  createPerfil,
  updatePerfilById,
  setPerfilEstadoById,
  getUsuarioById,
  getPerfilByCodigo,
  getPerfilById,
  listPerfilesByUsuario,
  upsertUsuarioPerfil,
  deactivateUsuarioPerfil,
};
