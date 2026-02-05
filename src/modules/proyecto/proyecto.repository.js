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
  estadoPedido: new Map(),
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

async function getEstadoPedidoIdByNombre(nombre) {
  return getIdByNombre({
    table: "T_Estado_Pedido",
    idCol: "PK_EP_Cod",
    nameCol: "EP_Nombre",
    nombre,
    cache: nombreCache.estadoPedido,
  });
}

async function getProyectoInfoByDiaId(diaId) {
  const [rows] = await pool.query(
    `SELECT
       pr.PK_Pro_Cod AS proyectoId,
       pr.Pro_Estado AS proyectoEstadoId,
       pr.FK_P_Cod AS pedidoId,
       p.FK_EP_Cod AS pedidoEstadoId
     FROM T_ProyectoDia pd
     JOIN T_Proyecto pr ON pr.PK_Pro_Cod = pd.FK_Pro_Cod
     LEFT JOIN T_Pedido p ON p.PK_P_Cod = pr.FK_P_Cod
     WHERE pd.PK_PD_Cod = ?
     LIMIT 1`,
    [Number(diaId)]
  );
  return rows?.[0] || null;
}

async function updatePedidoEstadoById(pedidoId, estadoPedidoId) {
  const [result] = await pool.query(
    "UPDATE T_Pedido SET FK_EP_Cod = ? WHERE PK_P_Cod = ?",
    [Number(estadoPedidoId), Number(pedidoId)]
  );
  return { affectedRows: result.affectedRows };
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
  const empleadosDia = sets[4] || [];
  const incidenciasDia = sets[8] || [];

  if (empleadosDia.length) {
    const ids = [...new Set(empleadosDia.map((e) => Number(e.empleadoId)).filter(Boolean))];
    if (ids.length) {
      const [rowsCargo] = await pool.query(
        `SELECT em.PK_Em_Cod AS empleadoId,
                te.PK_Tipo_Emp_Cod AS cargoId,
                te.TiEm_Cargo AS cargo
         FROM T_Empleados em
         JOIN T_Tipo_Empleado te ON te.PK_Tipo_Emp_Cod = em.FK_Tipo_Emp_Cod
         WHERE em.PK_Em_Cod IN (?)`,
        [ids]
      );
      const cargoMap = new Map(
        rowsCargo.map((r) => [Number(r.empleadoId), { cargoId: r.cargoId, cargo: r.cargo }])
      );
      for (const emp of empleadosDia) {
        const extra = cargoMap.get(Number(emp.empleadoId));
        if (extra) {
          emp.cargoId = extra.cargoId;
          emp.cargo = extra.cargo;
        }
      }
    }
  }

  if (incidenciasDia.length) {
    const emIds = new Set();
    const eqIds = new Set();
    const userIds = new Set();
    const diaIds = new Set();
    incidenciasDia.forEach((i) => {
      if (i.empleadoId) emIds.add(Number(i.empleadoId));
      if (i.empleadoReemplazoId) emIds.add(Number(i.empleadoReemplazoId));
      if (i.equipoId) eqIds.add(Number(i.equipoId));
      if (i.equipoReemplazoId) eqIds.add(Number(i.equipoReemplazoId));
      if (i.usuarioId) userIds.add(Number(i.usuarioId));
      if (i.diaId) diaIds.add(Number(i.diaId));
    });

    const empleadosMap = new Map();
    if (emIds.size) {
      const [rowsEm] = await pool.query(
        `SELECT em.PK_Em_Cod AS empleadoId,
                te.PK_Tipo_Emp_Cod AS cargoId,
                te.TiEm_Cargo AS cargo,
                CONCAT(u.U_Nombre, ' ', u.U_Apellido) AS nombre
         FROM T_Empleados em
         JOIN T_Tipo_Empleado te ON te.PK_Tipo_Emp_Cod = em.FK_Tipo_Emp_Cod
         JOIN T_Usuario u ON u.PK_U_Cod = em.FK_U_Cod
         WHERE em.PK_Em_Cod IN (?)`,
        [[...emIds]]
      );
      rowsEm.forEach((r) => {
        empleadosMap.set(Number(r.empleadoId), {
          empleadoNombre: r.nombre,
          empleadoCargoId: r.cargoId,
          empleadoCargo: r.cargo,
        });
      });
    }

    const equiposMap = new Map();
    if (eqIds.size) {
      const [rowsEq] = await pool.query(
        `SELECT eq.PK_Eq_Cod AS equipoId,
                eq.Eq_Serie AS equipoSerie,
                mo.NMo_Nombre AS equipoModelo,
                te.TE_Nombre AS equipoTipo
         FROM T_Equipo eq
         JOIN T_Modelo mo ON mo.PK_IMo_Cod = eq.FK_IMo_Cod
         JOIN T_Tipo_Equipo te ON te.PK_TE_Cod = mo.FK_TE_Cod
         WHERE eq.PK_Eq_Cod IN (?)`,
        [[...eqIds]]
      );
      rowsEq.forEach((r) => {
        equiposMap.set(Number(r.equipoId), {
          equipoSerie: r.equipoSerie,
          equipoModelo: r.equipoModelo,
          equipoTipo: r.equipoTipo,
        });
      });
    }

    const usuariosMap = new Map();
    if (userIds.size) {
      const [rowsU] = await pool.query(
        `SELECT PK_U_Cod AS usuarioId,
                CONCAT(U_Nombre, ' ', U_Apellido) AS usuarioNombre
         FROM T_Usuario
         WHERE PK_U_Cod IN (?)`,
        [[...userIds]]
      );
      rowsU.forEach((r) => {
        usuariosMap.set(Number(r.usuarioId), { usuarioNombre: r.usuarioNombre });
      });
    }

    const proyectoDiaMap = new Map();
    if (diaIds.size) {
      const [rowsPd] = await pool.query(
        `SELECT PK_PD_Cod AS diaId, FK_Pro_Cod AS proyectoId
         FROM T_ProyectoDia
         WHERE PK_PD_Cod IN (?)`,
        [[...diaIds]]
      );
      rowsPd.forEach((r) => proyectoDiaMap.set(Number(r.diaId), { proyectoId: r.proyectoId }));
    }

    incidenciasDia.forEach((i) => {
      const em = i.empleadoId ? empleadosMap.get(Number(i.empleadoId)) : null;
      const emR = i.empleadoReemplazoId
        ? empleadosMap.get(Number(i.empleadoReemplazoId))
        : null;
      const eq = i.equipoId ? equiposMap.get(Number(i.equipoId)) : null;
      const eqR = i.equipoReemplazoId ? equiposMap.get(Number(i.equipoReemplazoId)) : null;
      const us = i.usuarioId ? usuariosMap.get(Number(i.usuarioId)) : null;
      const pd = i.diaId ? proyectoDiaMap.get(Number(i.diaId)) : null;
      Object.assign(
        i,
        em
          ? {
              empleadoNombre: em.empleadoNombre,
              empleadoCargoId: em.empleadoCargoId,
              empleadoCargo: em.empleadoCargo,
            }
          : {},
        emR
          ? {
              empleadoReemplazoNombre: emR.empleadoNombre,
              empleadoReemplazoCargoId: emR.empleadoCargoId,
              empleadoReemplazoCargo: emR.empleadoCargo,
            }
          : {},
        eq
          ? {
              equipoSerie: eq.equipoSerie,
              equipoModelo: eq.equipoModelo,
              equipoTipo: eq.equipoTipo,
            }
          : {},
        eqR
          ? {
              equipoReemplazoSerie: eqR.equipoSerie,
              equipoReemplazoModelo: eqR.equipoModelo,
              equipoReemplazoTipo: eqR.equipoTipo,
            }
          : {},
        us ? { usuarioNombre: us.usuarioNombre } : {},
        pd ? { proyectoId: pd.proyectoId } : {}
      );
    });
  }

  return {
    proyecto,
    dias: sets[1] || [],
    bloquesDia: sets[2] || [],
    serviciosDia: sets[3] || [],
    empleadosDia,
    equiposDia: sets[5] || [],
    requerimientosPersonalDia: sets[6] || [],
    requerimientosEquipoDia: sets[7] || [],
    incidenciasDia,
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

      // Salvaguarda: si quedaron responsables que ya no están asignados ese día, ponerlos en NULL
      await conn.query(
        `UPDATE T_ProyectoDiaEquipo
           SET FK_Em_Cod = NULL
         WHERE FK_PD_Cod = ?
           AND FK_Em_Cod IS NOT NULL
           AND FK_Em_Cod NOT IN (
             SELECT FK_Em_Cod FROM T_ProyectoDiaEmpleado WHERE FK_PD_Cod = ?
           )`,
        [diaId, diaId]
      );
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
    fechaHoraEvento = null,
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
         (FK_PD_Cod, PDI_Tipo, PDI_Descripcion, PDI_FechaHora_Evento, FK_Em_Cod, FK_Em_Reemplazo_Cod, FK_Eq_Cod, FK_Eq_Reemplazo_Cod, FK_U_Cod)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        Number(diaId),
        tipo,
        descripcion,
        fechaHoraEvento,
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
      // Marcar el equipo averiado, pero mantener la asignación original
      await conn.query(
        `UPDATE T_ProyectoDiaEquipo
           SET PDQ_Notas = CONCAT('INCIDENCIA: equipo averiado', CASE WHEN PDQ_Notas IS NULL OR PDQ_Notas = '' THEN '' ELSE CONCAT(' - ', PDQ_Notas) END)
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
           VALUES (?,?,NULL,'INCIDENCIA: equipo de reemplazo')`,
          [Number(diaId), Number(equipoReemplazoId)]
        );
      }

      // Reasignar equipos donde el empleado era responsable en ese día
      await conn.query(
        `UPDATE T_ProyectoDiaEquipo
           SET FK_Em_Cod = ?, PDQ_Notas = CONCAT('INCIDENCIA: responsable reemplazado', CASE WHEN PDQ_Notas IS NULL OR PDQ_Notas = '' THEN '' ELSE CONCAT(' - ', PDQ_Notas) END)
         WHERE FK_PD_Cod = ? AND FK_Em_Cod = ?`,
        [Number(empleadoReemplazoId), Number(diaId), Number(empleadoId)]
      );
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

async function updateDevolucionEquipos(diaId, equipos = [], usuarioId = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rowsDia] = await conn.query(
      `SELECT FK_Pro_Cod FROM T_ProyectoDia WHERE PK_PD_Cod = ? LIMIT 1`,
      [Number(diaId)]
    );
    if (!rowsDia.length) {
      const err = new Error("Dia no encontrado");
      err.status = 404;
      throw err;
    }

    let updated = 0;
    for (const item of equipos) {
      const eqId = Number(item.equipoId);
      const [rowsEq] = await conn.query(
        `SELECT 1 FROM T_ProyectoDiaEquipo WHERE FK_PD_Cod = ? AND FK_Eq_Cod = ? LIMIT 1`,
        [Number(diaId), eqId]
      );
      if (!rowsEq.length) {
        const err = new Error(`Equipo ${eqId} no encontrado en el dia`);
        err.status = 404;
        throw err;
      }

      const fecha =
        item.fechaDevolucion && item.fechaDevolucion !== "auto"
          ? item.fechaDevolucion
          : null; // null => NOW() en SQL

      await conn.query(
        `UPDATE T_ProyectoDiaEquipo
           SET PDQ_Devuelto = ?,
               PDQ_Fecha_Devolucion = COALESCE(?, NOW()),
               PDQ_Estado_Devolucion = ?,
               PDQ_Notas_Devolucion = ?,
               PDQ_Usuario_Devolucion = ?
         WHERE FK_PD_Cod = ? AND FK_Eq_Cod = ?`,
        [
          Number(item.devuelto) ? 1 : 0,
          fecha,
          item.estadoDevolucion ?? null,
          item.notasDevolucion ?? null,
          usuarioId == null ? null : Number(usuarioId),
          Number(diaId),
          eqId,
        ]
      );
      updated += 1;
    }

    await conn.commit();
    return { updated };
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
  getEstadoPedidoIdByNombre,
  listEstadoProyectoDia,
  updateProyectoDiaEstado,
  getProyectoInfoByDiaId,
  upsertProyectoAsignaciones,
  createProyectoDiaIncidencia,
  updatePedidoEstadoById,
  updateDevolucionEquipos,
};
