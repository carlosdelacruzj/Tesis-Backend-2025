// services/pedido.service.js
const repo = require("./pedido.repository");

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const HMS = /^\d{2}:\d{2}(:\d{2})?$/;

function toHms(h) {
  if (!h) return null;
  return h.length === 5 ? `${h}:00` : h;
}
function assert(cond, msg, code = 422) {
  if (!cond) {
    const e = new Error(msg);
    e.status = code;
    throw e;
  }
}
function assertRequired(v, f) {
  if (v == null || String(v).trim() === "") {
    const e = new Error(`El campo '${f}' es requerido`);
    e.status = 400;
    throw e;
  }
}
function assertPositiveNumber(v, f) {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) {
    const e = new Error(`El campo '${f}' debe ser un número positivo`);
    e.status = 400;
    throw e;
  }
  return n;
}

function validatePayload(payload) {
  assert(payload && typeof payload === "object", "Body requerido");
  const { pedido, eventos, items } = payload;

  // pedido
  assert(pedido, "pedido requerido");
  assert(Number.isInteger(pedido.empleadoId), "empleadoId inválido");
  assert(
    typeof pedido.fechaCreacion === "string" &&
      ISO_DATE.test(pedido.fechaCreacion),
    "fechaCreacion debe ser YYYY-MM-DD"
  );
  assert(Number.isInteger(pedido.estadoPedidoId), "estadoPedidoId inválido");
  assert(Number.isInteger(pedido.estadoPagoId), "estadoPagoId inválido");

  // eventos
  assert(
    Array.isArray(eventos) && eventos.length > 0,
    "Debe enviar al menos 1 evento"
  );
  eventos.forEach((e, i) => {
    assert(
      typeof e.fecha === "string" && ISO_DATE.test(e.fecha),
      `eventos[${i}].fecha inválida`
    );
    if (e.hora)
      assert(HMS.test(e.hora), `eventos[${i}].hora debe ser HH:mm[:ss]`);
  });

  // items
  assert(
    Array.isArray(items) && items.length > 0,
    "Debe enviar al menos 1 item"
  );
  items.forEach((it, i) => {
    assert(
      typeof it.nombre === "string" && it.nombre.trim(),
      `items[${i}].nombre requerido`
    );
    assert(
      typeof it.precioUnit === "number" && !Number.isNaN(it.precioUnit),
      `items[${i}].precioUnit inválido`
    );
  });

  // === Validaciones de longitudes para evitar truncados en MySQL ===
  // Eventos
  eventos.forEach((e, i) => {
    if (e.ubicacion && e.ubicacion.length > 100)
      throw Object.assign(
        new Error(`eventos[${i}].ubicacion supera 100 caracteres`),
        { status: 422 }
      );
    if (e.direccion && e.direccion.length > 150)
      throw Object.assign(
        new Error(`eventos[${i}].direccion supera 150 caracteres`),
        { status: 422 }
      );
    if (e.notas && e.notas.length > 255)
      throw Object.assign(
        new Error(`eventos[${i}].notas supera 255 caracteres`),
        { status: 422 }
      );
  });
  // Items
  items.forEach((it, i) => {
    if (it.nombre && it.nombre.length > 120)
      throw Object.assign(
        new Error(`items[${i}].nombre supera 120 caracteres`),
        { status: 422 }
      );
    if (it.descripcion && it.descripcion.length > 255)
      throw Object.assign(
        new Error(`items[${i}].descripcion supera 255 caracteres`),
        { status: 422 }
      );
    if (it.notas && it.notas.length > 150)
      throw Object.assign(
        new Error(`items[${i}].notas supera 150 caracteres`),
        { status: 422 }
      );
  });
}

function validateUpdatePayload(payload) {
  assert(payload && typeof payload === "object", "Body requerido");

  const pedido = payload?.pedido;
  const ev = payload?.eventos; // <— alias, NO “eventos”
  const its = payload?.items; // <— alias, NO “items”

  // pedido
  assert(pedido && Number.isInteger(pedido.id), "pedido.id requerido");

  if (pedido.empleadoId != null)
    assert(Number.isInteger(pedido.empleadoId), "empleadoId inválido");
  if (pedido.fechaCreacion != null)
    assert(
      typeof pedido.fechaCreacion === "string" &&
        ISO_DATE.test(pedido.fechaCreacion),
      "fechaCreacion debe ser YYYY-MM-DD"
    );
  if (pedido.estadoPedidoId != null)
    assert(Number.isInteger(pedido.estadoPedidoId), "estadoPedidoId inválido");
  if (pedido.estadoPagoId != null)
    assert(Number.isInteger(pedido.estadoPagoId), "estadoPagoId inválido");

  // eventos (opcional)
  if (ev !== undefined) {
    if (ev !== null) {
      assert(Array.isArray(ev), "eventos debe ser array");
      ev.forEach((e, i) => {
        if (e.id != null)
          assert(Number.isInteger(e.id), `eventos[${i}].id inválido`);
        if (e.fecha != null)
          assert(
            typeof e.fecha === "string" && ISO_DATE.test(e.fecha),
            `eventos[${i}].fecha inválida`
          );
        if (e.hora != null)
          assert(HMS.test(e.hora), `eventos[${i}].hora debe ser HH:mm[:ss]`);
        if (e.ubicacion && e.ubicacion.length > 100)
          throw Object.assign(
            new Error(`eventos[${i}].ubicacion supera 100 caracteres`),
            { status: 422 }
          );
        if (e.direccion && e.direccion.length > 150)
          throw Object.assign(
            new Error(`eventos[${i}].direccion supera 150 caracteres`),
            { status: 422 }
          );
        if (e.notas && e.notas.length > 255)
          throw Object.assign(
            new Error(`eventos[${i}].notas supera 255 caracteres`),
            { status: 422 }
          );
      });
    }
    // ev === null => “no tocar” coleccion (válido)
  }

  // items (opcional)
  if (its !== undefined) {
    if (its !== null) {
      assert(Array.isArray(its), "items debe ser array");
      its.forEach((it, i) => {
        if (it.id != null)
          assert(Number.isInteger(it.id), `items[${i}].id inválido`);
        if (it.nombre != null)
          assert(
            typeof it.nombre === "string" && it.nombre.trim(),
            `items[${i}].nombre requerido`
          );
        if (it.precioUnit != null)
          assert(
            typeof it.precioUnit === "number" && !Number.isNaN(it.precioUnit),
            `items[${i}].precioUnit inválido`
          );
        if (it.nombre && it.nombre.length > 120)
          throw Object.assign(
            new Error(`items[${i}].nombre supera 120 caracteres`),
            { status: 422 }
          );
        if (it.descripcion && it.descripcion.length > 255)
          throw Object.assign(
            new Error(`items[${i}].descripcion supera 255 caracteres`),
            { status: 422 }
          );
        if (it.notas && it.notas.length > 150)
          throw Object.assign(
            new Error(`items[${i}].notas supera 150 caracteres`),
            { status: 422 }
          );
      });
    }
    // its === null => “no tocar” coleccion (válido)
  }
}

async function listAllPedidos() {
  return repo.getAll();
}
async function listIndexPedidos() {
  return repo.getIndex();
}
async function findPedidoById(id) {
  const n = assertPositiveNumber(id, "id");
  const p = await repo.getById(n);
  if (!p) {
    const e = new Error(`Pedido con id ${n} no encontrado`);
    e.status = 404;
    throw e;
  }
  return p;
}
async function findLastEstadoPedido() {
  return repo.getLastEstado();
}

async function createNewPedido(payload) {
  validatePayload(payload);

  // Normalizar horas HH:mm -> HH:mm:ss y limpiar strings
  const norm = {
    ...payload,
    pedido: {
      ...payload.pedido,
      observaciones: (payload.pedido.observaciones || "").trim() || null,
    },
    eventos: payload.eventos.map((e, idx) => ({
      clientEventKey: e.clientEventKey ?? idx + 1, // fallback a índice base 1
      fecha: e.fecha,
      hora: toHms(e.hora || null),
      ubicacion: (e.ubicacion || "").trim() || null,
      direccion: (e.direccion || "").trim() || null,
      notas: (e.notas || "").trim() || null,
    })),
    items: payload.items.map((it) => ({
      exsId: it.exsId ?? null,
      eventoCodigo: it.eventoCodigo ?? null, // si traes asociación, se mapeará luego
      // cambia a "PEN" si tu negocio factura en soles
      moneda: (it.moneda || "USD").toUpperCase(),
      nombre: it.nombre.trim(),
      descripcion: (it.descripcion || "").trim() || null,
      precioUnit: Number(it.precioUnit),
      cantidad: Number(it.cantidad ?? 1),
      descuento: Number(it.descuento ?? 0),
      recargo: Number(it.recargo ?? 0),
      notas: (it.notas || "").trim() || null,
    })),
  };

  // (opcional) log en dev
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.dir({ payloadNormalizado: norm }, { depth: null });
  }

  // Orquestar transacción en repo
  const result = await repo.createComposite(norm);
  return { status: "Registro exitoso", ...result };
}

async function updatePedidoById(payload) {
  validateUpdatePayload(payload);

  const pedido = payload.pedido;
  const ev = payload.eventos; // alias
  const its = payload.items; // alias

  const pedidoId = Number(pedido.id);
  assertPositiveNumber(pedidoId, "pedido.id");

  const norm = {
    pedido: {
      id: pedidoId,
      clienteId: pedido.clienteId ?? null,
      cliente: pedido.cliente?.documento
        ? { documento: String(pedido.cliente.documento).trim() }
        : undefined,
      empleadoId: pedido.empleadoId ?? null,
      fechaCreacion: pedido.fechaCreacion ?? null,
      estadoPedidoId: pedido.estadoPedidoId ?? null,
      estadoPagoId: pedido.estadoPagoId ?? null,
      nombrePedido: pedido.nombrePedido ?? null,
      observaciones: (pedido.observaciones ?? "").trim() || null,
    },
    eventos: Array.isArray(ev)
      ? ev.map((e, idx) => ({
          id: e.id ?? null,
          clientEventKey: e.clientEventKey ?? idx + 1,
          fecha: e.fecha ?? null,
          hora: e.hora ? toHms(e.hora) : null,
          ubicacion: (e.ubicacion ?? "").trim() || null,
          direccion: (e.direccion ?? "").trim() || null,
          notas: (e.notas ?? "").trim() || null,
        }))
      : ev === null
      ? null
      : undefined, // undefined: no mandes esta propiedad al repo
    items: Array.isArray(its)
      ? its.map((it) => ({
          id: it.id ?? null,
          exsId: it.exsId ?? null,
          eventoCodigo: it.eventoCodigo ?? null,
          moneda: (it.moneda || "USD").toUpperCase(),
          nombre: it.nombre != null ? it.nombre.trim() : null,
          descripcion: (it.descripcion || "").trim() || null,
          precioUnit: it.precioUnit != null ? Number(it.precioUnit) : null,
          cantidad: Number(it.cantidad ?? 1),
          descuento: Number(it.descuento ?? 0),
          recargo: Number(it.recargo ?? 0),
          notas: (it.notas || "").trim() || null,
        }))
      : its === null
      ? null
      : undefined,
  };

  if (process.env.NODE_ENV !== "production") {
    console.dir({ payloadUpdateNormalizado: norm }, { depth: null });
  }

  // Importante: llama al repo nuevo (no al SP legacy)
  const result = await repo.updateCompositeById(pedidoId, norm);
  return { status: "Actualización exitosa", ...result };
}

module.exports = {
  listAllPedidos,
  listIndexPedidos,
  findPedidoById,
  findLastEstadoPedido,
  createNewPedido,
  updatePedidoById,
};
