// src/modules/empleado/empleado.repository.js
const pool = require("../../db");

async function runCall(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
}

const nombreCache = {
  estadoEmpleado: new Map(),
};

async function getIdByNombre({ table, idCol, nameCol, nombre, cache }) {
  const key = String(nombre || "").trim().toLowerCase();
  if (!key) throw new Error(`Nombre requerido para ${table}`);
  if (cache.has(key)) return cache.get(key);
  const [rows] = await pool.query(
    `SELECT ${idCol} AS id FROM ${table} WHERE LOWER(${nameCol}) = LOWER(?) LIMIT 1`,
    [nombre]
  );
  const id = rows?.[0]?.id;
  if (!id) {
    throw new Error(`No se encontro ${table} para nombre: ${nombre}`);
  }
  cache.set(key, Number(id));
  return Number(id);
}

async function getEstadoEmpleadoIdByNombre(nombre) {
  return getIdByNombre({
    table: "T_Estado_Empleado",
    idCol: "PK_Estado_Emp_Cod",
    nameCol: "EsEm_Nombre",
    nombre,
    cache: nombreCache.estadoEmpleado,
  });
}

const t = (v) => (typeof v === "string" ? v.trim() : v ?? null);

// Lecturas
async function getAll() {
  return runCall("CALL sp_empleado_listar()");
}

async function getCargos() {
  return runCall("CALL sp_empleado_cargo_listar()");
}

async function getOperativosActivos() {
  const activoId = await getEstadoEmpleadoIdByNombre("Activo");
  const [rows] = await pool.query(
    `SELECT
       em.PK_Em_Cod          AS empleadoId,
       u.PK_U_Cod            AS usuarioId,
       u.U_Nombre            AS nombre,
       u.U_Apellido          AS apellido,
       te.PK_Tipo_Emp_Cod    AS cargoId,
       te.TiEm_Cargo         AS cargo,
       em.FK_Estado_Emp_Cod  AS estadoId,
       ee.EsEm_Nombre        AS estadoNombre,
       te.TiEm_OperativoCampo AS operativoCampo
     FROM T_Empleados em
     JOIN T_Usuario u        ON u.PK_U_Cod = em.FK_U_Cod
     JOIN T_Tipo_Empleado te ON te.PK_Tipo_Emp_Cod = em.FK_Tipo_Emp_Cod
     LEFT JOIN T_Estado_Empleado ee ON ee.PK_Estado_Emp_Cod = em.FK_Estado_Emp_Cod
     WHERE te.TiEm_OperativoCampo = 1
       AND em.FK_Estado_Emp_Cod = ?
     ORDER BY te.PK_Tipo_Emp_Cod, u.U_Nombre, u.U_Apellido`,
    [activoId]
  );
  return rows;
}

async function getById(id) {
  try {
    return await runCall("CALL sp_empleado_obtener(?)", [Number(id)]);
  } catch (err) {
    err.message = `[empleado.repo] getById: ${err.message}`;
    throw err;
  }
}

// Escrituras
async function create({ nombre, apellido, correo, celular, documento, tipoDocumentoId, direccion, autonomo, cargo }) {
  await runCall("CALL sp_empleado_crear(?,?,?,?,?,?,?,?,?)", [
    t(nombre),
    t(apellido),
    t(correo),
    t(celular),
    t(documento),
    Number(tipoDocumentoId),
    t(direccion),
    autonomo != null ? Number(autonomo) : null,
    cargo != null ? Number(cargo) : null,
  ]);
}

async function updateById({ idEmpleado, celular, correo, direccion, estado }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rowsEmp] = await conn.query(
      `SELECT FK_U_Cod AS usuarioId
       FROM T_Empleados
       WHERE PK_Em_Cod = ?
       LIMIT 1`,
      [Number(idEmpleado)]
    );
    const usuarioId = rowsEmp?.[0]?.usuarioId;
    if (!usuarioId) {
      const err = new Error("Empleado no encontrado");
      err.status = 404;
      throw err;
    }

    const setsUsuario = [];
    const paramsUsuario = [];
    if (celular !== undefined) {
      setsUsuario.push("U_Celular = ?");
      paramsUsuario.push(t(celular));
    }
    if (correo !== undefined) {
      setsUsuario.push("U_Correo = ?");
      paramsUsuario.push(t(correo));
    }
    if (direccion !== undefined) {
      setsUsuario.push("U_Direccion = ?");
      paramsUsuario.push(t(direccion));
    }

    if (setsUsuario.length) {
      paramsUsuario.push(Number(usuarioId));
      await conn.query(
        `UPDATE T_Usuario
         SET ${setsUsuario.join(", ")}
         WHERE PK_U_Cod = ?`,
        paramsUsuario
      );
    }

    if (estado != null) {
      await conn.query(
        `UPDATE T_Empleados
         SET FK_Estado_Emp_Cod = ?
         WHERE PK_Em_Cod = ?`,
        [Number(estado), Number(idEmpleado)]
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
  getAll,
  getCargos,
  getOperativosActivos,
  getById,
  create,
  updateById,
  getEstadoEmpleadoIdByNombre,
};

