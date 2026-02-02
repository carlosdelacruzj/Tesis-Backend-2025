const pool = require("../../db");
const { formatCodigo } = require("../../utils/codigo");
const { getLimaDateTimeString } = require("../../utils/dates");

async function runCall(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
}

// Para SP que devuelven múltiples result sets
async function runCallMulti(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return Array.isArray(rows) ? rows.filter(Array.isArray) : [];
}

const nombreCache = {
  estadoProyecto: new Map(),
  estadoProyectoDia: new Map(),
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

async function getEstadoProyectoIdByNombre(nombre) {
  return getIdByNombre({
    table: "T_Estado_Proyecto",
    idCol: "PK_EPro_Cod",
    nameCol: "EPro_Nombre",
    nombre,
    cache: nombreCache.estadoProyecto,
  });
}

async function getEstadoProyectoDiaIdByNombre(nombre) {
  return getIdByNombre({
    table: "T_Estado_Proyecto_Dia",
    idCol: "PK_EPD_Cod",
    nameCol: "EPD_Nombre",
    nombre,
    cache: nombreCache.estadoProyectoDia,
  });
}

/* Proyecto */
async function getAllProyecto() {
  const rows = await runCall("CALL sp_proyecto_listar()");
  return Array.isArray(rows)
    ? rows.map((r) => ({
        ...r,
        codigo: formatCodigo("PRO", r.proyectoId ?? r.id ?? r.ID),
        pedidoCodigo: formatCodigo("PED", r.pedidoId ?? r.PedidoId ?? r.FK_Ped_Cod),
      }))
    : rows;
}

async function getByIdProyecto(id) {
  // Se espera que el SP retorne:
  //   0: proyecto
  //   1: dias
  //   2: bloques por dia
  //   3: servicios por dia
  //   4: empleados por dia
  //   5: equipos por dia
  //   6: requerimientos personal por dia
  //   7: requerimientos equipo por dia
  //   8: incidencias por dia
  const sets = await runCallMulti("CALL sp_proyecto_obtener(?)", [Number(id)]);
  const proyectoRaw = sets[0]?.[0] || null;
  const pedidoId =
    proyectoRaw?.pedidoId ?? proyectoRaw?.PedidoId ?? proyectoRaw?.FK_Ped_Cod ?? null;
  const proyecto = proyectoRaw
    ? {
        ...proyectoRaw,
        codigo: formatCodigo("PRO", proyectoRaw.proyectoId ?? proyectoRaw.id),
        pedidoCodigo: pedidoId == null ? null : formatCodigo("PED", pedidoId),
      }
    : null;
  return {
    proyecto,
    dias: sets[1] || [],
    bloquesDia: sets[2] || [],
    serviciosDia: sets[3] || [],
    empleadosDia: sets[4] || [],
    equiposDia: sets[5] || [],
    requerimientosPersonalDia: sets[6] || [],
    requerimientosEquipoDia: sets[7] || [],
    incidenciasDia: sets[8] || [],
  };
}

async function postProyecto(payload) {
  const { pedidoId, responsableId = null, notas = null, enlace = null } = payload;
  return runCall("CALL sp_proyecto_crear_desde_pedido(?,?,?,?)", [
    Number(pedidoId),
    responsableId == null ? null : Number(responsableId),
    notas ?? null,
    enlace ?? null,
  ]);
}

async function putProyectoById(id, payload) {
  const {
    proyectoNombre,
    fechaInicioEdicion,
    fechaFinEdicion,
    estadoId,
    responsableId,
    notas,
    enlace,
    multimedia,
    edicion,
  } = payload;
  return runCall("CALL sp_proyecto_actualizar(?,?,?,?,?,?,?,?,?,?,?)", [
    Number(id),
    proyectoNombre ?? null,
    fechaInicioEdicion ?? null,
    fechaFinEdicion ?? null,
    estadoId ?? null,
    responsableId ?? null,
    notas ?? null,
    enlace ?? null,
    multimedia ?? null,
    edicion ?? null,
    getLimaDateTimeString(),
  ]);
}

async function patchProyectoById(id, payload = {}) {
  const {
    proyectoNombre,
    fechaInicioEdicion,
    fechaFinEdicion,
    estadoId,
    responsableId,
    notas,
    enlace,
    multimedia,
    edicion,
  } = payload;

  // Sólo actualiza columnas si se envían; evita sobreescribir con NULL no enviado.
  // Usa un UPDATE directo para flexibilidad.
  const fields = [];
  const params = [];

  if (proyectoNombre !== undefined) {
    fields.push("Pro_Nombre = ?");
    params.push(proyectoNombre ?? null);
  }
  if (fechaInicioEdicion !== undefined) {
    fields.push("EPro_Fecha_Inicio_Edicion = ?");
    params.push(fechaInicioEdicion ?? null);
  }
  if (fechaFinEdicion !== undefined) {
    fields.push("Pro_Fecha_Fin_Edicion = ?");
    params.push(fechaFinEdicion ?? null);
  }
  if (estadoId !== undefined) {
    fields.push("Pro_Estado = ?");
    params.push(estadoId ?? null);
  }
  if (responsableId !== undefined) {
    fields.push("FK_Em_Cod = ?");
    params.push(responsableId ?? null);
  }
  if (notas !== undefined) {
    fields.push("Pro_Notas = ?");
    params.push(notas ?? null);
  }
  if (enlace !== undefined) {
    fields.push("Pro_Enlace = ?");
    params.push(enlace ?? null);
  }
  if (multimedia !== undefined) {
    fields.push("Pro_Revision_Multimedia = ?");
    params.push(multimedia ?? null);
  }
  if (edicion !== undefined) {
    fields.push("Pro_Revision_Edicion = ?");
    params.push(edicion ?? null);
  }

  if (!fields.length) {
    return { affectedRows: 0 };
  }

  fields.push("updated_at = ?");
  params.push(getLimaDateTimeString());
  params.push(Number(id));

  const [result] = await pool.query(
    `UPDATE T_Proyecto
     SET ${fields.join(", ")}
     WHERE PK_Pro_Cod = ?`,
    params
  );

  return { affectedRows: result.affectedRows };
}

async function deleteProyecto(id) {
  return runCall("CALL sp_proyecto_eliminar(?)", [Number(id)]);
}

async function getPagoInfoByPedido(pedidoId) {
  const [rows] = await pool.query(
    "SELECT SaldoPendiente, MontoAbonado, EstadoPagoId FROM V_Pedido_Saldos WHERE PedidoId = ?",
    [Number(pedidoId)]
  );
  return rows;
}

async function listEstadoProyecto() {
  const [rows] = await pool.query(
    `SELECT
       PK_EPro_Cod AS estadoId,
       EPro_Nombre AS estadoNombre,
       EPro_Orden  AS orden,
       Activo      AS activo
     FROM T_Estado_Proyecto
     ORDER BY EPro_Orden, PK_EPro_Cod`
  );
  return rows;
}

async function listEstadoProyectoDia() {
  const [rows] = await pool.query(
    `SELECT
       PK_EPD_Cod AS estadoDiaId,
       EPD_Nombre AS estadoDiaNombre,
       EPD_Orden  AS orden,
       Activo     AS activo
     FROM T_Estado_Proyecto_Dia
     ORDER BY EPD_Orden, PK_EPD_Cod`
  );
  return rows;
}

async function updateProyectoDiaEstado(diaId, estadoDiaId) {
  const [result] = await pool.query(
    `UPDATE T_ProyectoDia
     SET FK_EPD_Cod = ?, updated_at = ?
     WHERE PK_PD_Cod = ?`,
    [Number(estadoDiaId), getLimaDateTimeString(), Number(diaId)]
  );
  return { affectedRows: result.affectedRows };
}

async function getDisponibilidad({
  fechaInicio,
  fechaFin,
  proyectoId = null,
  tipoEquipoId = null,
  cargoId = null,
}) {
  const sets = await runCallMulti("CALL sp_proyecto_disponibilidad(?,?,?,?,?)", [
    fechaInicio ?? null,
    fechaFin ?? null,
    proyectoId == null ? null : Number(proyectoId),
    tipoEquipoId == null ? null : Number(tipoEquipoId),
    cargoId == null ? null : Number(cargoId),
  ]);
  return {
    empleados: sets[0] || [],
    equipos: sets[1] || [],
  };
}

async function upsertProyectoAsignaciones(proyectoId, dias = []) {
  const conn = await pool.getConnection();
  let totalEmpleados = 0;
  let totalEquipos = 0;
  try {
    await conn.beginTransaction();

    for (const dia of dias) {
      const diaId = Number(dia.diaId);
      const [rowsDia] = await conn.query(
        `SELECT 1
         FROM T_ProyectoDia
         WHERE PK_PD_Cod = ? AND FK_Pro_Cod = ?
         LIMIT 1`,
        [diaId, Number(proyectoId)]
      );
      if (!rowsDia.length) {
        const err = new Error("Dia no encontrado en el proyecto");
        err.status = 404;
        throw err;
      }

      await conn.query(`DELETE FROM T_ProyectoDiaEmpleado WHERE FK_PD_Cod = ?`, [
        diaId,
      ]);
      await conn.query(`DELETE FROM T_ProyectoDiaEquipo WHERE FK_PD_Cod = ?`, [
        diaId,
      ]);

      if (dia.empleados?.length) {
        const values = dia.empleados.map((e) => [
          diaId,
          Number(e.empleadoId),
          e.notas ?? null,
        ]);
        await conn.query(
          `INSERT INTO T_ProyectoDiaEmpleado
             (FK_PD_Cod, FK_Em_Cod, PDE_Notas)
           VALUES ?`,
          [values]
        );
        totalEmpleados += dia.empleados.length;
      }

      if (dia.equipos?.length) {
        const values = dia.equipos.map((e) => [
          diaId,
          Number(e.equipoId),
          e.responsableId == null ? null : Number(e.responsableId),
          e.notas ?? null,
        ]);
        await conn.query(
          `INSERT INTO T_ProyectoDiaEquipo
             (FK_PD_Cod, FK_Eq_Cod, FK_Em_Cod, PDQ_Notas)
           VALUES ?`,
          [values]
        );
        totalEquipos += dia.equipos.length;
      }
    }

    await conn.commit();
    return { dias: dias.length, empleados: totalEmpleados, equipos: totalEquipos };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function createProyectoDiaIncidencia(diaId, payload = {}) {
  const {
    tipo,
    descripcion,
    empleadoId = null,
    empleadoReemplazoId = null,
    equipoId = null,
    equipoReemplazoId = null,
    usuarioId = null,
  } = payload;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rowsDia] = await conn.query(
      `SELECT 1
       FROM T_ProyectoDia
       WHERE PK_PD_Cod = ?
       LIMIT 1`,
      [Number(diaId)]
    );
    if (!rowsDia.length) {
      const err = new Error("Dia no encontrado");
      err.status = 404;
      throw err;
    }

    const [incResult] = await conn.query(
      `INSERT INTO T_ProyectoDiaIncidencia
         (FK_PD_Cod, PDI_Tipo, PDI_Descripcion, FK_Em_Cod, FK_Em_Reemplazo_Cod, FK_Eq_Cod, FK_Eq_Reemplazo_Cod, FK_U_Cod)
       VALUES (?,?,?,?,?,?,?,?)`,
      [
        Number(diaId),
        tipo,
        descripcion,
        empleadoId == null ? null : Number(empleadoId),
        empleadoReemplazoId == null ? null : Number(empleadoReemplazoId),
        equipoId == null ? null : Number(equipoId),
        equipoReemplazoId == null ? null : Number(equipoReemplazoId),
        usuarioId == null ? null : Number(usuarioId),
      ]
    );

    if (empleadoId != null && empleadoReemplazoId != null) {
      await conn.query(
        `DELETE FROM T_ProyectoDiaEmpleado
         WHERE FK_PD_Cod = ? AND FK_Em_Cod = ?`,
        [Number(diaId), Number(empleadoId)]
      );
      const [rowsExists] = await conn.query(
        `SELECT 1
         FROM T_ProyectoDiaEmpleado
         WHERE FK_PD_Cod = ? AND FK_Em_Cod = ?
         LIMIT 1`,
        [Number(diaId), Number(empleadoReemplazoId)]
      );
      if (!rowsExists.length) {
        await conn.query(
          `INSERT INTO T_ProyectoDiaEmpleado
             (FK_PD_Cod, FK_Em_Cod, PDE_Notas)
           VALUES (?,?,NULL)`,
          [Number(diaId), Number(empleadoReemplazoId)]
        );
      }
    }

    if (equipoId != null && equipoReemplazoId != null) {
      await conn.query(
        `DELETE FROM T_ProyectoDiaEquipo
         WHERE FK_PD_Cod = ? AND FK_Eq_Cod = ?`,
        [Number(diaId), Number(equipoId)]
      );
      const [rowsExists] = await conn.query(
        `SELECT 1
         FROM T_ProyectoDiaEquipo
         WHERE FK_PD_Cod = ? AND FK_Eq_Cod = ?
         LIMIT 1`,
        [Number(diaId), Number(equipoReemplazoId)]
      );
      if (!rowsExists.length) {
        await conn.query(
          `INSERT INTO T_ProyectoDiaEquipo
             (FK_PD_Cod, FK_Eq_Cod, FK_Em_Cod, PDQ_Notas)
           VALUES (?,?,NULL,NULL)`,
          [Number(diaId), Number(equipoReemplazoId)]
        );
      }
    }

    await conn.commit();
    return { incidenciaId: incResult.insertId ?? null };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = {
  getAllProyecto,
  getByIdProyecto,
  postProyecto,
  putProyectoById,
  deleteProyecto,
  getPagoInfoByPedido,
  listEstadoProyecto,
  getDisponibilidad,
  patchProyectoById,
  getEstadoProyectoIdByNombre,
  getEstadoProyectoDiaIdByNombre,
  listEstadoProyectoDia,
  updateProyectoDiaEstado,
  upsertProyectoAsignaciones,
  createProyectoDiaIncidencia,
};
