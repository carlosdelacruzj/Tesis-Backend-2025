const pool = require("../../db");
const { formatCodigo } = require("../../utils/codigo");
const { getLimaDateTimeString } = require("../../utils/dates");
const { randomUUID } = require("crypto");
const { ESTADOS_EQUIPO_OBJETIVO, ESTADOS_EQUIPO_IDS_ESPERADOS } = require("./devolucion.rules");

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

async function getProyectoDiaFechaById(diaId, queryable = pool) {
  const [rows] = await queryable.query(
    `SELECT PK_PD_Cod AS diaId, PD_Fecha AS fecha
     FROM T_ProyectoDia
     WHERE PK_PD_Cod = ?
     LIMIT 1`,
    [Number(diaId)]
  );
  return rows?.[0] || null;
}

async function countDiasNoTerminados(proyectoId, estadoTerminadoId) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS cnt
     FROM T_ProyectoDia
     WHERE FK_Pro_Cod = ?
       AND (FK_EPD_Cod IS NULL OR FK_EPD_Cod <> ?)`,
    [Number(proyectoId), Number(estadoTerminadoId)]
  );
  return Number(rows?.[0]?.cnt || 0);
}

async function countDiasNoCancelados(proyectoId, estadoCanceladoId) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS cnt
     FROM T_ProyectoDia
     WHERE FK_Pro_Cod = ?
       AND (FK_EPD_Cod IS NULL OR FK_EPD_Cod <> ?)`,
    [Number(proyectoId), Number(estadoCanceladoId)]
  );
  return Number(rows?.[0]?.cnt || 0);
}

async function countEquiposNoDevueltos(proyectoId) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS cnt
     FROM T_ProyectoDiaEquipo pdq
     JOIN T_ProyectoDia pd ON pd.PK_PD_Cod = pdq.FK_PD_Cod
     WHERE pd.FK_Pro_Cod = ?
       AND (
         pdq.PDQ_Estado_Devolucion IS NULL
         OR UPPER(pdq.PDQ_Estado_Devolucion) NOT IN ('DEVUELTO', 'DANADO', 'PERDIDO', 'ROBADO')
         OR (
           UPPER(pdq.PDQ_Estado_Devolucion) = 'DEVUELTO'
           AND COALESCE(pdq.PDQ_Devuelto, -1) <> 1
         )
         OR (
           UPPER(pdq.PDQ_Estado_Devolucion) = 'DANADO'
           AND COALESCE(pdq.PDQ_Devuelto, -1) <> 1
         )
         OR (
           UPPER(pdq.PDQ_Estado_Devolucion) = 'PERDIDO'
           AND COALESCE(pdq.PDQ_Devuelto, -1) <> 0
         )
         OR (
           UPPER(pdq.PDQ_Estado_Devolucion) = 'ROBADO'
           AND COALESCE(pdq.PDQ_Devuelto, -1) <> 0
         )
       )`,
    [Number(proyectoId)]
  );
  return Number(rows?.[0]?.cnt || 0);
}
async function updatePedidoEstadoById(pedidoId, estadoPedidoId) {
  const [result] = await pool.query(
    "UPDATE T_Pedido SET FK_EP_Cod = ? WHERE PK_P_Cod = ?",
    [Number(estadoPedidoId), Number(pedidoId)]
  );
  return { affectedRows: result.affectedRows };
}

async function getEstadoEquipoIdByNombreValidado(queryable = pool) {
  const estadosEsperados = Object.entries(ESTADOS_EQUIPO_IDS_ESPERADOS);
  const nombres = estadosEsperados.map(([nombre]) => nombre);
  const placeholders = nombres.map(() => "?").join(", ");
  const [rows] = await queryable.query(
    `SELECT PK_EE_Cod AS estadoId, EE_Nombre AS estadoNombre
       FROM T_Estado_Equipo
      WHERE EE_Nombre IN (${placeholders})`,
    nombres
  );

  const byNombre = new Map((rows || []).map((r) => [String(r.estadoNombre), Number(r.estadoId)]));
  for (const [nombre, idEsperado] of estadosEsperados) {
    const idReal = byNombre.get(nombre);
    if (!idReal) {
      const err = new Error(`Estado de equipo no encontrado: ${nombre}`);
      err.status = 500;
      throw err;
    }
    if (Number(idReal) !== Number(idEsperado)) {
      const err = new Error(
        `Integridad de T_Estado_Equipo invalida para '${nombre}': esperado ${idEsperado}, obtenido ${idReal}`
      );
      err.status = 500;
      throw err;
    }
  }

  return byNombre;
}

async function ensureDevolucionJobTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS T_ProyectoDevolucionJob (
      PK_PDJ_Cod INT NOT NULL AUTO_INCREMENT,
      PDJ_UUID VARCHAR(64) NOT NULL,
      FK_PD_Cod INT NOT NULL,
      FK_U_Cod INT NULL,
      PDJ_Estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
      PDJ_Request_JSON JSON NOT NULL,
      PDJ_Result_JSON JSON NULL,
      PDJ_Error VARCHAR(500) NULL,
      PDJ_Intentos INT NOT NULL DEFAULT 0,
      PDJ_Started_At DATETIME NULL,
      PDJ_Completed_At DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (PK_PDJ_Cod),
      UNIQUE KEY uq_pdj_uuid (PDJ_UUID),
      KEY ix_pdj_estado_created (PDJ_Estado, created_at),
      KEY ix_pdj_dia (FK_PD_Cod)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function createDevolucionJob(diaId, payload = {}, usuarioId = null) {
  await ensureDevolucionJobTable();
  const generated = typeof randomUUID === "function" ? randomUUID() : `${Date.now()}_${Math.random()}`;
  const jobId = String(generated).replace(/-/g, "");
  const [result] = await pool.query(
    `INSERT INTO T_ProyectoDevolucionJob
       (PDJ_UUID, FK_PD_Cod, FK_U_Cod, PDJ_Estado, PDJ_Request_JSON)
     VALUES (?, ?, ?, 'PENDIENTE', ?)`,
    [jobId, Number(diaId), usuarioId == null ? null : Number(usuarioId), JSON.stringify(payload || {})]
  );
  return { jobId, internalId: Number(result.insertId) };
}

async function getDevolucionJobById(jobId) {
  await ensureDevolucionJobTable();
  const [rows] = await pool.query(
    `SELECT
       PK_PDJ_Cod AS internalId,
       PDJ_UUID AS jobId,
       FK_PD_Cod AS diaId,
       FK_U_Cod AS usuarioId,
       PDJ_Estado AS estado,
       PDJ_Request_JSON AS requestJson,
       PDJ_Result_JSON AS resultJson,
       PDJ_Error AS error,
       PDJ_Intentos AS intentos,
       PDJ_Started_At AS startedAt,
       PDJ_Completed_At AS completedAt,
       created_at AS createdAt,
       updated_at AS updatedAt
     FROM T_ProyectoDevolucionJob
     WHERE PDJ_UUID = ?
     LIMIT 1`,
    [String(jobId)]
  );
  return rows?.[0] || null;
}

async function getProyectoInfoByProyectoId(proyectoId) {
  const [rows] = await pool.query(
    `SELECT
       pr.PK_Pro_Cod AS proyectoId,
       pr.Pro_Estado AS proyectoEstadoId,
       pr.FK_P_Cod AS pedidoId,
       p.FK_EP_Cod AS pedidoEstadoId
     FROM T_Proyecto pr
     LEFT JOIN T_Pedido p ON p.PK_P_Cod = pr.FK_P_Cod
     WHERE pr.PK_Pro_Cod = ?
     LIMIT 1`,
    [Number(proyectoId)]
  );
  return rows?.[0] || null;
}

async function claimNextPendingDevolucionJob() {
  await ensureDevolucionJobTable();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query(
      `SELECT PK_PDJ_Cod AS internalId, PDJ_UUID AS jobId, FK_PD_Cod AS diaId, PDJ_Request_JSON AS requestJson
       FROM T_ProyectoDevolucionJob
       WHERE PDJ_Estado = 'PENDIENTE'
       ORDER BY created_at ASC, PK_PDJ_Cod ASC
       LIMIT 1
       FOR UPDATE`
    );
    if (!rows.length) {
      await conn.commit();
      return null;
    }
    const job = rows[0];
    await conn.query(
      `UPDATE T_ProyectoDevolucionJob
       SET PDJ_Estado = 'PROCESANDO',
           PDJ_Intentos = PDJ_Intentos + 1,
           PDJ_Started_At = ?,
           updated_at = ?
       WHERE PK_PDJ_Cod = ?`,
      [getLimaDateTimeString(), getLimaDateTimeString(), Number(job.internalId)]
    );
    await conn.commit();
    return {
      internalId: Number(job.internalId),
      jobId: String(job.jobId),
      diaId: Number(job.diaId),
      requestJson: job.requestJson,
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function completeDevolucionJob(internalId, result = null) {
  await ensureDevolucionJobTable();
  await pool.query(
    `UPDATE T_ProyectoDevolucionJob
     SET PDJ_Estado = 'COMPLETADO',
         PDJ_Result_JSON = ?,
         PDJ_Error = NULL,
         PDJ_Completed_At = ?,
         updated_at = ?
     WHERE PK_PDJ_Cod = ?`,
    [
      result == null ? null : JSON.stringify(result),
      getLimaDateTimeString(),
      getLimaDateTimeString(),
      Number(internalId),
    ]
  );
}

async function failDevolucionJob(internalId, errorMessage) {
  await ensureDevolucionJobTable();
  await pool.query(
    `UPDATE T_ProyectoDevolucionJob
     SET PDJ_Estado = 'ERROR',
         PDJ_Error = ?,
         PDJ_Completed_At = ?,
         updated_at = ?
     WHERE PK_PDJ_Cod = ?`,
    [
      String(errorMessage || "Error no especificado").slice(0, 500),
      getLimaDateTimeString(),
      getLimaDateTimeString(),
      Number(internalId),
    ]
  );
}

function formatFechaLargaEs(fechaValue) {
  if (!fechaValue) return null;
  const raw = String(fechaValue);
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return raw;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const text = new Intl.DateTimeFormat("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : raw;
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

  if (proyecto && pedidoId != null) {
    const [rowsPago] = await pool.query(
      `SELECT
         p.FK_ESP_Cod AS estadoPagoId,
         ep.ESP_Nombre AS estadoPagoNombre
       FROM T_Pedido p
       LEFT JOIN T_Estado_Pago ep ON ep.PK_ESP_Cod = p.FK_ESP_Cod
       WHERE p.PK_P_Cod = ?
       LIMIT 1`,
      [Number(pedidoId)]
    );
    const pago = rowsPago?.[0] || null;
    proyecto.estadoPagoId = pago?.estadoPagoId ?? null;
    proyecto.estadoPagoNombre = pago?.estadoPagoNombre ?? null;
  }

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
    preEntregaEnlace,
    preEntregaTipo,
    preEntregaFeedback,
    preEntregaFecha,
    respaldoUbicacion,
    respaldoNotas,
    entregaFinalEnlace,
    entregaFinalFecha,
    estadoId,
    responsableId,
    notas,
    enlace,
  } = payload;
  return runCall("CALL sp_proyecto_actualizar(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [
    Number(id),
    proyectoNombre ?? null,
    fechaInicioEdicion ?? null,
    fechaFinEdicion ?? null,
    preEntregaEnlace ?? null,
    preEntregaTipo ?? null,
    preEntregaFeedback ?? null,
    preEntregaFecha ?? null,
    respaldoUbicacion ?? null,
    respaldoNotas ?? null,
    entregaFinalEnlace ?? null,
    entregaFinalFecha ?? null,
    estadoId ?? null,
    responsableId ?? null,
    notas ?? null,
    enlace ?? null,
    getLimaDateTimeString(),
  ]);
}

async function patchProyectoById(id, payload = {}) {
  const {
    proyectoNombre,
    fechaInicioEdicion,
    fechaFinEdicion,
    preEntregaEnlace,
    preEntregaTipo,
    preEntregaFeedback,
    preEntregaFecha,
    respaldoUbicacion,
    respaldoNotas,
    entregaFinalEnlace,
    entregaFinalFecha,
    estadoId,
    responsableId,
    notas,
    enlace,
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
  if (preEntregaEnlace !== undefined) {
    fields.push("Pro_Pre_Entrega_Enlace = ?");
    params.push(preEntregaEnlace ?? null);
  }
  if (preEntregaTipo !== undefined) {
    fields.push("Pro_Pre_Entrega_Tipo = ?");
    params.push(preEntregaTipo ?? null);
  }
  if (preEntregaFeedback !== undefined) {
    fields.push("Pro_Pre_Entrega_Feedback = ?");
    params.push(preEntregaFeedback ?? null);
  }
  if (preEntregaFecha !== undefined) {
    fields.push("Pro_Pre_Entrega_Fecha = ?");
    params.push(preEntregaFecha ?? null);
  }
  if (respaldoUbicacion !== undefined) {
    fields.push("Pro_Respaldo_Ubicacion = ?");
    params.push(respaldoUbicacion ?? null);
  }
  if (respaldoNotas !== undefined) {
    fields.push("Pro_Respaldo_Notas = ?");
    params.push(respaldoNotas ?? null);
  }
  if (entregaFinalEnlace !== undefined) {
    fields.push("Pro_Entrega_Final_Enlace = ?");
    params.push(entregaFinalEnlace ?? null);
  }
  if (entregaFinalFecha !== undefined) {
    fields.push("Pro_Entrega_Final_Fecha = ?");
    params.push(entregaFinalFecha ?? null);
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

async function getPedidosEstadosFinancierosByIds(pedidoIds = []) {
  const ids = [...new Set((pedidoIds || []).map((x) => Number(x)).filter((x) => x > 0))];
  if (!ids.length) return [];
  const placeholders = ids.map(() => "?").join(", ");
  const [rows] = await pool.query(
    `SELECT
       p.PK_P_Cod AS pedidoId,
       p.FK_EP_Cod AS estadoPedidoId,
       ep.EP_Nombre AS estadoPedidoNombre,
       p.FK_ESP_Cod AS estadoPagoId,
       esp.ESP_Nombre AS estadoPagoNombre
     FROM T_Pedido p
     LEFT JOIN T_Estado_Pedido ep ON ep.PK_EP_Cod = p.FK_EP_Cod
     LEFT JOIN T_Estado_Pago esp ON esp.PK_ESP_Cod = p.FK_ESP_Cod
     WHERE p.PK_P_Cod IN (${placeholders})`,
    ids
  );
  return rows || [];
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

async function cancelProyectoDia(diaId, payload = {}) {
  const {
    estadoCanceladoId,
    responsable,
    motivo,
    notas = null,
    cancelFecha = getLimaDateTimeString(),
    ncRequerida = 0,
  } = payload;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rowsDia] = await conn.query(
      `SELECT PK_PD_Cod AS diaId
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

    const [result] = await conn.query(
      `UPDATE T_ProyectoDia
       SET FK_EPD_Cod = ?,
           PD_CancelResponsable = ?,
           PD_CancelMotivo = ?,
           PD_CancelNotas = ?,
           PD_CancelFecha = ?,
           PD_NC_Requerida = ?,
           updated_at = ?
       WHERE PK_PD_Cod = ?`,
      [
        Number(estadoCanceladoId),
        String(responsable),
        String(motivo),
        notas,
        cancelFecha,
        Number(ncRequerida) ? 1 : 0,
        getLimaDateTimeString(),
        Number(diaId),
      ]
    );

    // Liberar recursos del dia cancelado para que vuelvan a estar disponibles.
    await conn.query(`DELETE FROM T_ProyectoDiaEquipo WHERE FK_PD_Cod = ?`, [Number(diaId)]);
    await conn.query(`DELETE FROM T_ProyectoDiaEmpleado WHERE FK_PD_Cod = ?`, [Number(diaId)]);
    await conn.query(
      `UPDATE T_ProyectoDiaIncidencia
       SET FK_Em_Cod = NULL,
           FK_Eq_Cod = NULL
       WHERE FK_PD_Cod = ?`,
      [Number(diaId)]
    );

    await conn.commit();
    return { affectedRows: result.affectedRows };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function getProyectoCancelacionMasivaContext(proyectoId) {
  const [rows] = await pool.query(
    `SELECT
       pr.PK_Pro_Cod AS proyectoId,
       pr.Pro_Nombre AS proyectoNombre,
       pr.Pro_Estado AS proyectoEstadoId,
       pr.FK_P_Cod AS pedidoId,
       p.FK_EP_Cod AS pedidoEstadoId,
       COUNT(pd.PK_PD_Cod) AS totalDias,
       SUM(CASE WHEN LOWER(COALESCE(epd.EPD_Nombre, '')) = 'pendiente' THEN 1 ELSE 0 END) AS diasPendientes,
       SUM(CASE WHEN LOWER(COALESCE(epd.EPD_Nombre, '')) = 'en curso' THEN 1 ELSE 0 END) AS diasEnCurso,
       SUM(CASE WHEN LOWER(COALESCE(epd.EPD_Nombre, '')) = 'cancelado' THEN 1 ELSE 0 END) AS diasCancelados,
       SUM(CASE WHEN LOWER(COALESCE(epd.EPD_Nombre, '')) = 'terminado' THEN 1 ELSE 0 END) AS diasTerminados,
       SUM(
         CASE
           WHEN LOWER(COALESCE(epd.EPD_Nombre, '')) IN ('pendiente', 'en curso', 'cancelado')
             THEN 0
           ELSE 1
         END
       ) AS diasNoPermitidos
     FROM T_Proyecto pr
     LEFT JOIN T_Pedido p
       ON p.PK_P_Cod = pr.FK_P_Cod
     LEFT JOIN T_ProyectoDia pd
       ON pd.FK_Pro_Cod = pr.PK_Pro_Cod
     LEFT JOIN T_Estado_Proyecto_Dia epd
       ON epd.PK_EPD_Cod = pd.FK_EPD_Cod
     WHERE pr.PK_Pro_Cod = ?
     GROUP BY pr.PK_Pro_Cod, pr.Pro_Nombre, pr.Pro_Estado, pr.FK_P_Cod, p.FK_EP_Cod
     LIMIT 1`,
    [Number(proyectoId)]
  );
  return rows?.[0] || null;
}

async function cancelProyectoDiasMasivo(proyectoId, payload = {}) {
  const {
    estadoCanceladoId,
    responsable,
    motivo,
    notas = null,
    cancelFecha = getLimaDateTimeString(),
    ncRequerida = 0,
    estadoProyectoCanceladoId = null,
    estadoPedidoCanceladoId = null,
    pedidoId = null,
  } = payload;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rowsProyecto] = await conn.query(
      `SELECT PK_Pro_Cod AS proyectoId
       FROM T_Proyecto
       WHERE PK_Pro_Cod = ?
       LIMIT 1`,
      [Number(proyectoId)]
    );
    if (!rowsProyecto.length) {
      const err = new Error("Proyecto no encontrado");
      err.status = 404;
      throw err;
    }

    const [rowsDias] = await conn.query(
      `SELECT
         PK_PD_Cod AS diaId,
         COALESCE(PD_MontoTotal, 0) AS montoTotal
       FROM T_ProyectoDia
       WHERE FK_Pro_Cod = ?
         AND (FK_EPD_Cod IS NULL OR FK_EPD_Cod <> ?)
       FOR UPDATE`,
      [Number(proyectoId), Number(estadoCanceladoId)]
    );

    const diaIds = (rowsDias || []).map((r) => Number(r.diaId));
    const montoTotal = Number(
      (rowsDias || []).reduce((acc, r) => acc + Number(r.montoTotal || 0), 0).toFixed(2)
    );

    let affectedRows = 0;
    if (diaIds.length) {
      const [result] = await conn.query(
        `UPDATE T_ProyectoDia
         SET FK_EPD_Cod = ?,
             PD_CancelResponsable = ?,
             PD_CancelMotivo = ?,
             PD_CancelNotas = ?,
             PD_CancelFecha = ?,
             PD_NC_Requerida = ?,
             updated_at = ?
         WHERE PK_PD_Cod IN (?)`,
        [
          Number(estadoCanceladoId),
          String(responsable),
          String(motivo),
          notas,
          cancelFecha,
          Number(ncRequerida) ? 1 : 0,
          getLimaDateTimeString(),
          diaIds,
        ]
      );
      affectedRows = Number(result.affectedRows || 0);

      // Liberar recursos de todos los dias cancelados.
      await conn.query(`DELETE FROM T_ProyectoDiaEquipo WHERE FK_PD_Cod IN (?)`, [diaIds]);
      await conn.query(`DELETE FROM T_ProyectoDiaEmpleado WHERE FK_PD_Cod IN (?)`, [diaIds]);
      await conn.query(
        `UPDATE T_ProyectoDiaIncidencia
         SET FK_Em_Cod = NULL,
             FK_Eq_Cod = NULL
         WHERE FK_PD_Cod IN (?)`,
        [diaIds]
      );
    }

    // Cambiar estado del proyecto dentro de la misma transaccion
    if (estadoProyectoCanceladoId != null) {
      await conn.query(
        `UPDATE T_Proyecto
         SET Pro_Estado = ?, updated_at = ?
         WHERE PK_Pro_Cod = ?`,
        [Number(estadoProyectoCanceladoId), getLimaDateTimeString(), Number(proyectoId)]
      );
    }

    // Cambiar estado del pedido dentro de la misma transaccion
    if (pedidoId != null && estadoPedidoCanceladoId != null) {
      await conn.query(
        `UPDATE T_Pedido
         SET FK_EP_Cod = ?
         WHERE PK_P_Cod = ?`,
        [Number(estadoPedidoCanceladoId), Number(pedidoId)]
      );
    }

    await conn.commit();
    return {
      affectedRows,
      diaIds,
      montoTotal,
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function setProyectoDiasNcVoucherByIds(diaIds = [], voucherId) {
  if (!Array.isArray(diaIds) || diaIds.length === 0) {
    return { affectedRows: 0 };
  }

  const [result] = await pool.query(
    `UPDATE T_ProyectoDia
     SET PD_NC_VoucherId = ?, updated_at = ?
     WHERE PK_PD_Cod IN (?)`,
    [Number(voucherId), getLimaDateTimeString(), diaIds.map((id) => Number(id))]
  );
  return { affectedRows: Number(result.affectedRows || 0) };
}

async function getProyectoDiaCancelContext(diaId) {
  const [rows] = await pool.query(
    `SELECT
       pd.PK_PD_Cod AS diaId,
       pr.FK_P_Cod AS pedidoId,
       pd.PD_MontoTotal AS montoTotal,
       pd.PD_NC_VoucherId AS ncVoucherId
     FROM T_ProyectoDia pd
     JOIN T_Proyecto pr ON pr.PK_Pro_Cod = pd.FK_Pro_Cod
     WHERE pd.PK_PD_Cod = ?
     LIMIT 1`,
    [Number(diaId)]
  );
  return rows?.[0] || null;
}

async function setProyectoDiaNcVoucher(diaId, voucherId) {
  const [result] = await pool.query(
    `UPDATE T_ProyectoDia
     SET PD_NC_VoucherId = ?, updated_at = ?
     WHERE PK_PD_Cod = ?`,
    [Number(voucherId), getLimaDateTimeString(), Number(diaId)]
  );
  return { affectedRows: result.affectedRows };
}

async function getMetodoPagoIdByNombre(nombre) {
  const [rows] = await pool.query(
    `SELECT PK_MP_Cod AS id
     FROM T_Metodo_Pago
     WHERE LOWER(MP_Nombre) = LOWER(?)
     LIMIT 1`,
    [String(nombre || "").trim()]
  );
  return rows?.[0]?.id != null ? Number(rows[0].id) : null;
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
      `SELECT FK_Pro_Cod, PD_Fecha AS fechaBase FROM T_ProyectoDia WHERE PK_PD_Cod = ? LIMIT 1`,
      [Number(diaId)]
    );
    if (!rowsDia.length) {
      const err = new Error("Dia no encontrado");
      err.status = 404;
      throw err;
    }
    const fechaBaseDia = rowsDia[0]?.fechaBase;

    const estadoEquipoIdByNombre = await getEstadoEquipoIdByNombreValidado(conn);

    let updated = 0;
    for (const item of equipos) {
      const eqId = Number(item.equipoId);
      const causaByEstado = {
        DANADO: "dano",
        PERDIDO: "perdida",
        ROBADO: "robo",
        DEVUELTO: "devolucion",
      };
      const resultadoByEstadoEquipo = {
        "De baja": "dado de baja",
        "En Mantenimiento": "enviado a mantenimiento",
        Disponible: "marcado como disponible",
      };
      const [rowsEq] = await conn.query(
        `SELECT
           pdq.PK_PDQ_Cod AS asignacionId,
           eq.PK_Eq_Cod AS equipoId,
           eq.Eq_Serie AS serie,
           mo.NMo_Nombre AS modeloNombre,
           te.TE_Nombre AS tipoEquipoNombre
         FROM T_ProyectoDiaEquipo pdq
         JOIN T_Equipo eq ON eq.PK_Eq_Cod = pdq.FK_Eq_Cod
         LEFT JOIN T_Modelo mo ON mo.PK_IMo_Cod = eq.FK_IMo_Cod
         LEFT JOIN T_Tipo_Equipo te ON te.PK_TE_Cod = mo.FK_TE_Cod
         WHERE pdq.FK_PD_Cod = ? AND pdq.FK_Eq_Cod = ?
         LIMIT 1`,
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
          : null;

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

      const estadoDevolucion = String(item.estadoDevolucion || "").toUpperCase();
      const estadoEquipoObjetivo = ESTADOS_EQUIPO_OBJETIVO[estadoDevolucion] || null;
      if (!estadoEquipoObjetivo) {
        const err = new Error(`estadoDevolucion no soportado para equipo ${eqId}`);
        err.status = 400;
        throw err;
      }

      const estadoEquipoObjetivoId = estadoEquipoIdByNombre.get(estadoEquipoObjetivo);
      if (!estadoEquipoObjetivoId) {
        const err = new Error(`Estado de equipo no encontrado: ${estadoEquipoObjetivo}`);
        err.status = 500;
        throw err;
      }

      await conn.query(
        `UPDATE T_Equipo
            SET FK_EE_Cod = ?
          WHERE PK_Eq_Cod = ?`,
        [estadoEquipoObjetivoId, eqId]
      );

      if (estadoEquipoObjetivo !== "Disponible") {
        const [rowsFuturas] = await conn.query(
          `SELECT
             pdq.PK_PDQ_Cod AS asignacionId,
             pdq.FK_PD_Cod AS diaFuturoId,
             pd.FK_Pro_Cod AS proyectoId,
             pd.PD_Fecha AS fecha,
             pr.Pro_Nombre AS proyectoNombre
           FROM T_ProyectoDiaEquipo pdq
           JOIN T_ProyectoDia pd ON pd.PK_PD_Cod = pdq.FK_PD_Cod
           JOIN T_Proyecto pr ON pr.PK_Pro_Cod = pd.FK_Pro_Cod
           WHERE pdq.FK_Eq_Cod = ?
             AND pdq.FK_PD_Cod <> ?
             AND pd.PD_Fecha >= DATE_ADD(?, INTERVAL 1 DAY)`,
          [eqId, Number(diaId), fechaBaseDia]
        );

        if ((rowsFuturas || []).length) {
          const eq = rowsEq[0] || {};
          const equipoNombre = [eq.tipoEquipoNombre, eq.modeloNombre].filter(Boolean).join(" ");
          const equipoLabel = equipoNombre
            ? `${equipoNombre} · ${eq.serie || `#${eqId}`}`
            : `#${eqId}`;
          const causa = causaByEstado[estadoDevolucion] || estadoDevolucion.toLowerCase();
          const resultado =
            resultadoByEstadoEquipo[estadoEquipoObjetivo] || `marcado como ${estadoEquipoObjetivo}`;
          const comentario = item.notasDevolucion
            ? ` Comentario: ${String(item.notasDevolucion).trim()}`
            : "";

          const impactosPorProyecto = new Map();
          for (const futura of rowsFuturas || []) {
            const proyectoId = Number(futura.proyectoId);
            const key = `${proyectoId}`;
            if (!impactosPorProyecto.has(key)) {
              impactosPorProyecto.set(key, {
                proyectoId,
                proyectoNombre: futura.proyectoNombre || `Proyecto ${proyectoId}`,
                fechas: [],
                fechaSet: new Set(),
              });
            }
            const bag = impactosPorProyecto.get(key);
            const fechaLarga = formatFechaLargaEs(futura.fecha);
            if (!bag.fechaSet.has(fechaLarga)) {
              bag.fechaSet.add(fechaLarga);
              bag.fechas.push(fechaLarga);
            }
          }

          const impactoTexto = Array.from(impactosPorProyecto.values())
            .map((p) => `[${p.proyectoNombre}] Fechas: ${p.fechas.join(" | ")}`)
            .join(" | ");

          const descripcion =
            `${equipoLabel} ${resultado} por ${causa}.` +
            `${comentario}` +
            ` Impacto en: ${impactoTexto}.`;

          await conn.query(
            `INSERT INTO T_ProyectoDiaIncidencia
               (FK_PD_Cod, PDI_Tipo, PDI_Descripcion, PDI_FechaHora_Evento, FK_Em_Cod, FK_Em_Reemplazo_Cod, FK_Eq_Cod, FK_Eq_Reemplazo_Cod, FK_U_Cod)
             VALUES (?, 'EQUIPO_DESASIGNADO_AUTOMATICO', ?, ?, NULL, NULL, ?, NULL, ?)`,
            [
              Number(diaId),
              descripcion,
              getLimaDateTimeString(),
              eqId,
              usuarioId == null ? null : Number(usuarioId),
            ]
          );

          const asignacionesIds = rowsFuturas.map((f) => Number(f.asignacionId));
          await conn.query(`DELETE FROM T_ProyectoDiaEquipo WHERE PK_PDQ_Cod IN (?)`, [
            asignacionesIds,
          ]);
        }
      }

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

async function previewDevolucionEquipo({ equipoId, fechaBase, diaId = null }) {
  await getEstadoEquipoIdByNombreValidado(pool);

  const [rowsEquipo] = await pool.query(
    `SELECT
       eq.PK_Eq_Cod AS equipoId,
       eq.Eq_Serie AS serie,
       mo.PK_IMo_Cod AS modeloId,
       mo.NMo_Nombre AS modeloNombre,
       te.PK_TE_Cod AS tipoEquipoId,
       te.TE_Nombre AS tipoEquipoNombre
     FROM T_Equipo eq
     LEFT JOIN T_Modelo mo ON mo.PK_IMo_Cod = eq.FK_IMo_Cod
     LEFT JOIN T_Tipo_Equipo te ON te.PK_TE_Cod = mo.FK_TE_Cod
     WHERE eq.PK_Eq_Cod = ?
     LIMIT 1`,
    [Number(equipoId)]
  );
  if (!rowsEquipo.length) {
    const err = new Error("Equipo no encontrado");
    err.status = 404;
    throw err;
  }

  const [rowsImpacto] = await pool.query(
    `SELECT
       pdq.PK_PDQ_Cod AS asignacionId,
       pd.PK_PD_Cod AS diaId,
       pd.PD_Fecha AS fecha,
       pd.FK_Pro_Cod AS proyectoId,
       pr.Pro_Nombre AS proyectoNombre
     FROM T_ProyectoDiaEquipo pdq
     JOIN T_ProyectoDia pd ON pd.PK_PD_Cod = pdq.FK_PD_Cod
     JOIN T_Proyecto pr ON pr.PK_Pro_Cod = pd.FK_Pro_Cod
     WHERE pdq.FK_Eq_Cod = ?
       AND (? IS NULL OR pdq.FK_PD_Cod <> ?)
       AND pd.PD_Fecha >= DATE_ADD(?, INTERVAL 1 DAY)
     ORDER BY pd.PD_Fecha, pd.PK_PD_Cod`,
    [Number(equipoId), diaId == null ? null : Number(diaId), diaId == null ? null : Number(diaId), fechaBase]
  );

  return {
    equipo: rowsEquipo[0],
    impacto: rowsImpacto || [],
  };
}

module.exports = {
  getAllProyecto,
  getByIdProyecto,
  postProyecto,
  putProyectoById,
  deleteProyecto,
  getPagoInfoByPedido,
  getPedidosEstadosFinancierosByIds,
  listEstadoProyecto,
  getDisponibilidad,
  patchProyectoById,
  getEstadoProyectoIdByNombre,
  getEstadoProyectoDiaIdByNombre,
  getEstadoPedidoIdByNombre,
  listEstadoProyectoDia,
  updateProyectoDiaEstado,
  cancelProyectoDia,
  getProyectoCancelacionMasivaContext,
  cancelProyectoDiasMasivo,
  getProyectoDiaCancelContext,
  setProyectoDiaNcVoucher,
  setProyectoDiasNcVoucherByIds,
  getMetodoPagoIdByNombre,
  getProyectoInfoByDiaId,
  getProyectoInfoByProyectoId,
  getProyectoDiaFechaById,
  countDiasNoTerminados,
  countDiasNoCancelados,
  countEquiposNoDevueltos,
  upsertProyectoAsignaciones,
  createProyectoDiaIncidencia,
  updatePedidoEstadoById,
  updateDevolucionEquipos,
  previewDevolucionEquipo,
  ensureDevolucionJobTable,
  createDevolucionJob,
  getDevolucionJobById,
  claimNextPendingDevolucionJob,
  completeDevolucionJob,
  failDevolucionJob,
};

