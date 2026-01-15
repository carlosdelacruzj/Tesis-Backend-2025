// pedido.repository.js
const pool = require("../../db");
const { formatCodigo } = require("../../utils/codigo");
const { getLimaDateTimeString } = require("../../utils/dates");

// ------------------------------
// Helpers de formato
// ------------------------------
const ISO_DATE_ONLY = /^(\d{4}-\d{2}-\d{2})/;
const toYMD = (v) => {
  if (!v) return null;
  if (typeof v === "string") {
    const m = v.trim().match(ISO_DATE_ONLY);
    if (m) return m[1]; // evita new Date("YYYY-MM-DD") que resta 1 día en TZ negativas
  }
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${d.getUTCFullYear()}-${mm}-${dd}`;
};
const toHMS = (v) => {
  if (!v) return null;
  const s = String(v);
  const m = s.match(/(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return null;
  return `${m[1]}:${m[2]}:${m[3] || "00"}`;
};
const t = (v) => (typeof v === "string" ? v.trim() : v ?? null);
function toHms(h) {
  if (h == null) return null;
  const s = String(h).trim();
  if (/^\d{2}:\d{2}$/.test(s)) return `${s}:00`;
  if (/^\d{2}:\d{2}:\d{2}$/.test(s)) return s;
  const err = new Error(`Hora inválida (esperado HH:mm[:ss]): ${h}`);
  err.status = 422;
  throw err;
}
// ------------------------------
// Utilidades de SP
// ------------------------------

// Para SPs que devuelven UN solo result set (la mayoría de listados)
async function runCall(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
}

// Para SPs que devuelven MÚLTIPLES result sets (como sp_pedido_obtener)
async function runCallMulti(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  // mysql2 entrega: [rows1, rows2, rows3, OkPacket, OkPacket, ...]
  // Nos quedamos solo con los arrays (los result sets reales)
  return Array.isArray(rows) ? rows.filter(Array.isArray) : [];
}

// ------------------------------
// Consultas / Procedures existentes
// ------------------------------
async function getAll() {
  const rows = await runCall("CALL sp_pedido_listar(?)", [getLimaDateTimeString()]);
  return rows.map((r) => {
    const id = r.ID ?? r.id ?? r.pedidoId ?? r.idPedido;
    return { ...r, codigo: formatCodigo("PED", id) };
  });
}

async function getByClienteId(clienteId) {
  const [rows] = await pool.query(
    "CALL sp_pedido_listar_por_cliente_detalle(?)",
    [Number(clienteId)]
  );
  const result = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
  const list = Array.isArray(result) ? result : [];
  return list.map((r) => ({
    ...r,
    codigo: formatCodigo("PED", r.pedidoId ?? r.ID ?? r.id),
  }));
}

async function getIndex() {
  return runCall("CALL sp_pedido_obtener_siguiente_id()");
}

async function getById(id) {
  // OJO: nombre del SP exacto (ID en mayúscula)
  const sets = await runCallMulti("CALL sp_pedido_obtener(?)", [id]);

  const cab = sets[0]?.[0] || null;
  const eventos = sets[1] || [];
  const items = sets[2] || [];

  if (!cab) return null;

  const pedido = {
    id: cab.id,
    codigo: formatCodigo("PED", cab.id),
    clienteId: cab.clienteId,
    cotizacionId: cab.cotizacionId ?? null,
    nombrePedido: cab.nombrePedido,
    empleadoId: cab.empleadoId,
    fechaCreacion: toYMD(cab.fechaCreacion),
    fechaEvento: toYMD(cab.fechaEvento),
    estadoPedidoId: cab.estadoPedidoId,
    estadoPagoId: cab.estadoPagoId,
    observaciones: cab.observaciones ?? null,
    idTipoEvento: cab.idTipoEvento ?? null,
    cliente: {
      id: cab.clienteId,
      documento: cab.clienteDocumento,
      nombres: cab.clienteNombres,
      apellidos: cab.clienteApellidos,
      celular: cab.clienteCelular,
      correo: cab.clienteCorreo,
      direccion: cab.clienteDireccion,
    },
    empleado: {
      nombres: cab.empleadoNombres,
      apellidos: cab.empleadoApellidos,
    },
  };

  const eventosOut = eventos.map((e) => ({
    id: e.id,
    pedidoId: e.pedidoId,
    fecha: toYMD(e.fecha), // "YYYY-MM-DD"
    hora: toHMS(e.hora), // "HH:mm:ss"
    ubicacion: e.ubicacion || "",
    direccion: e.direccion || "",
    notas: e.notas || "",
  }));

  const itemsOut = items.map((it) => ({
    id: it.id,
    pedidoId: it.pedidoId,
    eventoCodigo: it.eventoCodigo ?? null,
    idEventoServicio: it.idEventoServicio ?? it.exsId ?? null,
    eventoId: it.eventoId ?? null,
    servicioId: it.servicioId ?? null,
    nombre: it.nombre,
    descripcion: it.descripcion,
    moneda: it.moneda,
    precioUnit: Number(it.precioUnit || 0),
    cantidad: Number(it.cantidad || 1),
    descuento: Number(it.descuento || 0),
    recargo: Number(it.recargo || 0),
    notas: it.notas || "",
    horas: it.horas != null ? Number(it.horas) : null,
    personal: it.personal != null ? Number(it.personal) : null,
    fotosImpresas: it.fotosImpresas != null ? Number(it.fotosImpresas) : null,
    trailerMin: it.trailerMin != null ? Number(it.trailerMin) : null,
    filmMin: it.filmMin != null ? Number(it.filmMin) : null,
    subtotal: it.subtotal != null ? Number(it.subtotal) : null,
  }));

  return { pedido, eventos: eventosOut, items: itemsOut };
}

async function getLastEstado() {
  const result = await runCall("CALL sp_pedido_estado_obtener_ultimo()");
  return result[0] || null;
}

// ------------------------------
// Flujo NUEVO app-céntrico (create compuesto)
// ------------------------------
async function createComposite({ pedido, eventos, items }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1) Resolver clienteId (por id directo o por documento)
    let clienteId = pedido.clienteId || null;
    if (!clienteId && pedido.cliente?.documento) {
      const [rows] = await conn.query(
        `
        SELECT c.PK_Cli_Cod AS id
        FROM T_Cliente c
        JOIN T_Usuario u ON u.PK_U_Cod = c.FK_U_Cod
        WHERE u.U_Numero_Documento = TRIM(?)
        LIMIT 1
      `,
        [pedido.cliente.documento]
      );
      if (!rows.length) {
        const e = new Error(
          "Cliente no encontrado para el documento proporcionado"
        );
        e.status = 404;
        throw e;
      }
      clienteId = rows[0].id;
    }
    if (!clienteId) {
      const e = new Error("clienteId o cliente.documento es requerido");
      e.status = 422;
      throw e;
    }

    // 2) Insertar T_Pedido
    const [rPedido] = await conn.query(
      `
      INSERT INTO T_Pedido
      (FK_EP_Cod, FK_Cli_Cod, FK_ESP_Cod, FK_Cot_Cod, P_Fecha_Creacion, P_Observaciones, FK_Em_Cod, P_Nombre_Pedido, P_IdTipoEvento)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        pedido.estadoPedidoId,
        clienteId,
        pedido.estadoPagoId,
        pedido.cotizacionId,
        pedido.fechaCreacion,
        pedido.observaciones,
        pedido.empleadoId,
        pedido.nombrePedido,
        pedido.idTipoEvento ?? null,
      ]
    );
    const pedidoId = rPedido.insertId;

    // (Opcional) validar exsId para evitar FK rotas
    const exsIds = [
      ...new Set(
        items.map((it) => it.exsId ?? it.idEventoServicio).filter((v) => v !== null && v !== undefined)
      ),
    ];
    if (exsIds.length) {
      const [rowsExS] = await conn.query(
        `SELECT PK_ExS_Cod AS id FROM T_EventoServicio WHERE PK_ExS_Cod IN (${exsIds
          .map(() => "?")
          .join(",")})`,
        exsIds
      );
      const found = new Set(rowsExS.map((r) => r.id));
      const missing = exsIds.filter((id) => !found.has(id));
      if (missing.length) {
        const e = new Error(`exsId no existente: ${missing.join(", ")}`);
        e.status = 422;
        throw e;
      }
    }

    // 3) Insertar T_PedidoEvento (y mapear keys -> PK_PE_Cod)
    const eventKeyToPeId = new Map();
    for (let i = 0; i < eventos.length; i++) {
      const e = eventos[i];
      try {
        const [rEv] = await conn.query(
          `
          INSERT INTO T_PedidoEvento
          (FK_P_Cod, PE_Fecha, PE_Hora, PE_Ubicacion, PE_Direccion, PE_Notas)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
          [pedidoId, e.fecha, e.hora, e.ubicacion, e.direccion, e.notas]
        );
        const peId = rEv.insertId;
        // Permite que el front asocie items usando un "clientEventKey" si lo envía
        eventKeyToPeId.set(String(e.clientEventKey ?? i + 1), peId);
        eventKeyToPeId.set(String(i + 1), peId);
      } catch (err) {
        if (err && err.code === "ER_DUP_ENTRY") {
          const eDup = new Error(
            "Ya existe un evento con la misma fecha/hora/ubicación para este pedido"
          );
          eDup.status = 409;
          throw eDup;
        }
        throw err;
      }
    }

    // 4) Insertar T_PedidoServicio
    for (const it of items) {
      const exsId = it.exsId ?? it.idEventoServicio ?? null;
      const eventoId = it.eventoId ?? null;
      const servicioId = it.servicioId ?? null;
      const horas = it.horas ?? null;
      const personal = it.personal ?? it.staff ?? null;
      const fotosImpresas = it.fotosImpresas ?? null;
      const trailerMin = it.trailerMin ?? null;
      const filmMin = it.filmMin ?? null;
      let fkPe = null;
      if (it.eventoCodigo !== null && it.eventoCodigo !== undefined) {
        fkPe = eventKeyToPeId.get(String(it.eventoCodigo)) || null;
      }
      await conn.query(
        `
        INSERT INTO T_PedidoServicio
        (FK_P_Cod, FK_ExS_Cod, FK_PE_Cod, PS_EventoId, PS_ServicioId,
         PS_Nombre, PS_Descripcion, PS_Moneda,
         PS_PrecioUnit, PS_Cantidad, PS_Descuento, PS_Recargo, PS_Notas,
         PS_Horas, PS_Staff, PS_FotosImpresas, PS_TrailerMin, PS_FilmMin)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          pedidoId,
          exsId,
          fkPe,
          eventoId,
          servicioId,
          it.nombre,
          it.descripcion,
          it.moneda || "USD",
          it.precioUnit,
          it.cantidad ?? 1,
          it.descuento ?? 0,
          it.recargo ?? 0,
          it.notas,
          horas,
          personal,
          fotosImpresas,
          trailerMin,
          filmMin,
        ]
      );
    }

    await conn.commit();
    return { pedidoId };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
// ------------------------------
// Update compuesto (app-céntrico)
// ------------------------------
async function updateCompositeById(
  pedidoId,
  { pedido, eventos = [], items = [] }
) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 0) Sanidad básica
    if (!pedidoId) {
      const e = new Error("pedidoId es requerido");
      e.status = 422;
      throw e;
    }

    // 1) Validar/Resolver clienteId si vino en payload (opcional)
    let clienteId = pedido?.clienteId || null;
    if (!clienteId && pedido?.cliente?.documento) {
      const [rows] = await conn.query(
        `
        SELECT c.PK_Cli_Cod AS id
        FROM T_Cliente c
        JOIN T_Usuario u ON u.PK_U_Cod = c.FK_U_Cod
        WHERE u.U_Numero_Documento = TRIM(?)
        LIMIT 1
        `,
        [pedido.cliente.documento]
      );
      if (!rows.length) {
        const e = new Error(
          "Cliente no encontrado para el documento proporcionado"
        );
        e.status = 404;
        throw e;
      }
      clienteId = rows[0].id;
    }

    // 2) Actualizar cabecera T_Pedido (solo campos presentes)
    //    NOTA: si no quieres permitir cambio de cliente, saca FK_Cli_Cod
    const updFields = [];
    const updParams = [];
    // if (clienteId) {
    //   updFields.push("FK_Cli_Cod = ?");
    //   updParams.push(clienteId);
    // }
    if (pedido?.estadoPedidoId != null) {
      updFields.push("FK_EP_Cod = ?");
      updParams.push(pedido.estadoPedidoId);
    }
    if (pedido?.estadoPagoId != null) {
      updFields.push("FK_ESP_Cod = ?");
      updParams.push(pedido.estadoPagoId);
    }
    if (pedido?.fechaCreacion) {
      updFields.push("P_Fecha_Creacion = ?");
      updParams.push(pedido.fechaCreacion);
    }
    if (pedido?.observaciones != null) {
      updFields.push("P_Observaciones = ?");
      updParams.push(pedido.observaciones);
    }
    if (pedido?.empleadoId != null) {
      updFields.push("FK_Em_Cod = ?");
      updParams.push(pedido.empleadoId);
    }
    if (pedido?.nombrePedido != null) {
      updFields.push("P_Nombre_Pedido = ?");
      updParams.push(pedido.nombrePedido);
    }
    if (pedido?.idTipoEvento != null) {
      updFields.push("P_IdTipoEvento = ?");
      updParams.push(pedido.idTipoEvento);
    }
    if (pedido?.cotizacionId != null) {
      updFields.push("FK_Cot_Cod = ?");
      updParams.push(pedido.cotizacionId);
    }

    if (updFields.length) {
      updParams.push(pedidoId);
      await conn.query(
        `UPDATE T_Pedido SET ${updFields.join(", ")} WHERE PK_P_Cod = ?`,
        updParams
      );
    }

    // 3) Validar exsId de items (como en createComposite)
    const exsIds = [
      ...new Set(items.map((it) => it.exsId ?? it.idEventoServicio).filter((v) => v != null)),
    ];
    if (exsIds.length) {
      const [rowsExS] = await conn.query(
        `SELECT PK_ExS_Cod AS id FROM T_EventoServicio WHERE PK_ExS_Cod IN (${exsIds
          .map(() => "?")
          .join(",")})`,
        exsIds
      );
      const found = new Set(rowsExS.map((r) => r.id));
      const missing = exsIds.filter((id) => !found.has(id));
      if (missing.length) {
        const e = new Error(`exsId no existente: ${missing.join(", ")}`);
        e.status = 422;
        throw e;
      }
    }

    // 4) Traer estado actual de eventos e items para calcular diff
    const [dbEvents] = await conn.query(
      `SELECT PK_PE_Cod AS id FROM T_PedidoEvento WHERE FK_P_Cod = ?`,
      [pedidoId]
    );
    const dbEventIds = new Set(dbEvents.map((e) => e.id));

    const [dbItems] = await conn.query(
      `SELECT PK_PS_Cod AS id FROM T_PedidoServicio WHERE FK_P_Cod = ?`,
      [pedidoId]
    );
    const dbItemIds = new Set(dbItems.map((i) => i.id));

    // 5) UPSERT de eventos
    const incomingEventIds = new Set();
    for (const e of eventos || []) {
      const eid = e.id ?? null;
      const fecha = e.fecha;
      const hora = toHms(e.hora);
      const ubicacion = e.ubicacion;
      const direccion = e.direccion ?? null;
      const notas = e.notas ?? null;

      if (eid) {
        // UPDATE
        incomingEventIds.add(eid);
        await conn.query(
          `
          UPDATE T_PedidoEvento
          SET PE_Fecha = ?, PE_Hora = ?, PE_Ubicacion = ?, PE_Direccion = ?, PE_Notas = ?
          WHERE PK_PE_Cod = ? AND FK_P_Cod = ?
          `,
          [fecha, hora, ubicacion, direccion, notas, eid, pedidoId]
        );
      } else {
        // INSERT
        const [rEv] = await conn.query(
          `
          INSERT INTO T_PedidoEvento
          (FK_P_Cod, PE_Fecha, PE_Hora, PE_Ubicacion, PE_Direccion, PE_Notas)
          VALUES (?, ?, ?, ?, ?, ?)
          `,
          [pedidoId, fecha, hora, ubicacion, direccion, notas]
        );
        const newId = rEv.insertId;
        incomingEventIds.add(newId);
        // (Opcional) podrías mapear e.clientEventKey -> newId si decides soportar re-asignación de items
      }
    }

    // 6) Borrado de eventos que ya no vienen
    const eventsToDelete = [...dbEventIds].filter(
      (id) => !incomingEventIds.has(id)
    );
    if (eventsToDelete.length) {
      // Si tu FK T_PedidoServicio(FK_PE_Cod) **no** está en CASCADE, primero desasocia o borra items
      // a) Desasociar:
      // await conn.query(
      //   `UPDATE T_PedidoServicio SET FK_PE_Cod = NULL WHERE FK_P_Cod = ? AND FK_PE_Cod IN (${eventsToDelete.map(()=>'?').join(',')})`,
      //   [pedidoId, ...eventsToDelete]
      // );
      // b) O borrar directamente los items colgantes (elige una):
      // await conn.query(
      //   `DELETE FROM T_PedidoServicio WHERE FK_P_Cod = ? AND FK_PE_Cod IN (${eventsToDelete.map(()=>'?').join(',')})`,
      //   [pedidoId, ...eventsToDelete]
      // );

      await conn.query(
        `DELETE FROM T_PedidoEvento WHERE FK_P_Cod = ? AND PK_PE_Cod IN (${eventsToDelete
          .map(() => "?")
          .join(",")})`,
        [pedidoId, ...eventsToDelete]
      );
    }

    // 7) UPSERT de items
    const incomingItemIds = new Set();
    for (const it of items || []) {
      const eventoId = it.eventoId ?? null;
      const servicioId = it.servicioId ?? null;
      const horas = it.horas ?? null;
      const personal = it.personal ?? it.staff ?? null;
      const fotosImpresas = it.fotosImpresas ?? null;
      const trailerMin = it.trailerMin ?? null;
      const filmMin = it.filmMin ?? null;
      const iid = it.id ?? null; // <- si existe, actualiza
      const exsId = it.exsId ?? it.idEventoServicio ?? null; // FK a T_EventoServicio (obligatorio)
      const fkPe = it.eventoCodigo ?? null; // si asocias item a un evento específico

      if (iid) {
        incomingItemIds.add(iid);
        await conn.query(
          `
          UPDATE T_PedidoServicio
          SET FK_ExS_Cod = ?, FK_PE_Cod = ?, PS_EventoId = ?, PS_ServicioId = ?,
              PS_Nombre = ?, PS_Descripcion = ?, PS_Moneda = ?,
              PS_PrecioUnit = ?, PS_Cantidad = ?, PS_Descuento = ?, PS_Recargo = ?, PS_Notas = ?,
              PS_Horas = ?, PS_Staff = ?, PS_FotosImpresas = ?, PS_TrailerMin = ?, PS_FilmMin = ?
          WHERE PK_PS_Cod = ? AND FK_P_Cod = ?
          `,
          [
            exsId,
            fkPe,
            eventoId,
            servicioId,
            it.nombre,
            it.descripcion,
            it.moneda || "USD",
            it.precioUnit,
            it.cantidad ?? 1,
            it.descuento ?? 0,
            it.recargo ?? 0,
            it.notas ?? null,
            horas,
            personal,
            fotosImpresas,
            trailerMin,
            filmMin,
            iid,
            pedidoId,
          ]
        );
      } else {
        const [rIt] = await conn.query(
          `
          INSERT INTO T_PedidoServicio
          (FK_P_Cod, FK_ExS_Cod, FK_PE_Cod, PS_EventoId, PS_ServicioId,
           PS_Nombre, PS_Descripcion, PS_Moneda,
           PS_PrecioUnit, PS_Cantidad, PS_Descuento, PS_Recargo, PS_Notas,
           PS_Horas, PS_Staff, PS_FotosImpresas, PS_TrailerMin, PS_FilmMin)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            pedidoId,
            exsId,
            fkPe,
            eventoId,
            servicioId,
            it.nombre,
            it.descripcion,
            it.moneda || "USD",
            it.precioUnit,
            it.cantidad ?? 1,
            it.descuento ?? 0,
            it.recargo ?? 0,
            it.notas ?? null,
            horas,
            personal,
            fotosImpresas,
            trailerMin,
            filmMin,
          ]
        );
        incomingItemIds.add(rIt.insertId);
      }
    }

    // 8) Borrado de items que ya no vienen
    const itemsToDelete = [...dbItemIds].filter(
      (id) => !incomingItemIds.has(id)
    );
    if (itemsToDelete.length) {
      await conn.query(
        `DELETE FROM T_PedidoServicio WHERE FK_P_Cod = ? AND PK_PS_Cod IN (${itemsToDelete
          .map(() => "?")
          .join(",")})`,
        [pedidoId, ...itemsToDelete]
      );
    }

    await conn.commit();
    return { pedidoId };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
// ------------------------------
// Update por SP (legacy/mixto)
// ------------------------------
// async function updateById({
//   id,
//   estadoPedido,
//   fechaEvent,
//   horaEvent,
//   lugar,
//   empleado,
//   estadoPago,
// }) {
//   const params = [
//     Number(id),
//     estadoPedido,
//     fechaEvent,
//     horaEvent,
//     t(lugar),
//     empleado,
//     estadoPago,
//   ];
//   const result = await runCall("CALL sp_pedido_actualizar(?,?,?,?,?,?,?)", params);
//   return result[0];
// }

module.exports = {
  // consultas
  getAll,
  getByClienteId,
  getIndex,
  getById,
  getLastEstado,
  // flujo nuevo
  createComposite,
  updateCompositeById,
};
