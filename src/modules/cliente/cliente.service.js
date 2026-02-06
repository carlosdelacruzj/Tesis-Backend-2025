// src/modules/cliente/cliente.service.js
const repo = require("./cliente.repository");
const pedidoRepo = require("../pedido/pedido.repository");
const cotizacionRepo = require("../cotizacion/cotizacion.repository");
const {
  buildInitialPassword,
  hashPassword,
} = require("../../utils/password");
const { formatCodigo } = require("../../utils/codigo");
const { calcIgv } = require("../../utils/igv");

// Basic validation helpers
function assertString(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    const err = new Error(`Campo '${field}' es requerido`);
    err.status = 400;
    throw err;
  }
}

function assertMaxLength(value, field, max) {
  if (value != null && typeof value === "string" && value.length > max) {
    const err = new Error(`El campo '${field}' no puede exceder ${max} caracteres`);
    err.status = 422;
    throw err;
  }
}

function assertPositiveInt(value, field) {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) {
    const err = new Error(`Campo '${field}' debe ser un entero positivo`);
    err.status = 400;
    throw err;
  }
  return num;
}

async function list() {
  const rows = await repo.getAll();
  return Array.isArray(rows)
    ? rows.map((r) => ({
        ...r,
        codigo: r.codigoCliente ?? formatCodigo("CLI", r.idCliente),
      }))
    : rows;
}

async function findById(id) {
  const num = Number(id);
  if (!Number.isFinite(num) || num <= 0) {
    const err = new Error("id invalido");
    err.status = 400;
    throw err;
  }

  const data = await repo.getById(num);

  if (!data || data.length === 0) {
    const err = new Error(`Cliente con id ${num} no encontrado`);
    err.status = 404;
    throw err;
  }

  // El SP devuelve arreglo; normalizamos a un solo objeto.
  const cliente = Array.isArray(data) ? data[0] : data;
  return cliente
    ? { ...cliente, codigo: cliente.codigoCliente ?? formatCodigo("CLI", cliente.idCliente) }
    : cliente;
}

async function findByDoc(doc) {
  assertString(doc, "doc");
  const data = await repo.getByDoc(doc.trim());
  return data;
}

async function create(payload) {
  // Minimal validation so we do not break the SP call
  ["nombre", "apellido", "correo", "numDoc", "celular", "direccion"].forEach(
    (field) => assertString(payload[field], field)
  );
  if (payload.razonSocial != null && typeof payload.razonSocial !== "string") {
    const err = new Error("Campo 'razonSocial' debe ser texto");
    err.status = 400;
    throw err;
  }
  assertMaxLength(payload.razonSocial, "razonSocial", 150);
  payload.tipoDocumentoId = assertPositiveInt(
    payload.tipoDocumentoId,
    "tipoDocumentoId"
  );

  const plainPassword = buildInitialPassword(payload.nombre, payload.apellido);
  const contrasenaHash = hashPassword(plainPassword);

  await repo.create({ ...payload, contrasenaHash });
  return { Status: "Registro exitoso" };
}

async function update(payload) {
  const { idCliente, correo, celular, direccion, nombre, apellido, razonSocial } = payload;

  const idNum = Number(idCliente);
  if (idCliente == null || Number.isNaN(idNum) || idNum <= 0) {
    const err = new Error("idCliente es requerido");
    err.status = 400;
    throw err;
  }

  const nombreTrim = typeof nombre === "string" ? nombre.trim() : null;
  const apellidoTrim = typeof apellido === "string" ? apellido.trim() : null;
  const razonSocialTrim = typeof razonSocial === "string" ? razonSocial.trim() : null;

  if (
    !correo &&
    !celular &&
    !direccion &&
    !nombreTrim &&
    !apellidoTrim &&
    !razonSocialTrim
  ) {
    const err = new Error(
      "al menos uno de [nombre, apellido, correo, celular, direccion, razonSocial] es requerido"
    );
    err.status = 400;
    throw err;
  }

  // Validaciones de longitud segun SP sp_cliente_actualizar
  assertMaxLength(nombreTrim, "nombre", 25);
  assertMaxLength(apellidoTrim, "apellido", 25);
  assertMaxLength(correo, "correo", 250);
  assertMaxLength(celular, "celular", 25);
  assertMaxLength(direccion, "direccion", 150);
  assertMaxLength(razonSocialTrim, "razonSocial", 150);

  const updated = await repo.updateById({
    idCliente: idNum,
    nombre: nombreTrim,
    apellido: apellidoTrim,
    correo,
    celular,
    direccion,
    razonSocial: razonSocialTrim,
  });
  const normalized = Array.isArray(updated) ? updated[0] : updated;
  return normalized || { Status: "Actualizacion exitosa" };
}

async function autocomplete({ query, limit = 10 }) {
  assertString(query, "query");
  const q = query.trim();
  if (q.length < 2) {
    const err = new Error("query debe tener al menos 2 caracteres");
    err.status = 400;
    throw err;
  }
  const lim = Number.isFinite(Number(limit)) ? Number(limit) : 10;
  const rows = await repo.autocomplete({ query: q, limit: lim });
  return Array.isArray(rows)
    ? rows.map((r) => ({
        ...r,
        codigo: r.codigoCliente ?? formatCodigo("CLI", r.idCliente),
      }))
    : rows;
}

async function listPedidosByCliente(id) {
  const num = Number(id);
  if (!Number.isFinite(num) || num <= 0) {
    const err = new Error("idCliente invalido");
    err.status = 400;
    throw err;
  }
  const rows = await pedidoRepo.getByClienteId(num);
  if (!Array.isArray(rows)) return rows;
  return rows.map((r) => {
      const hasIgv = r?.igv != null || r?.subtotal != null;
      let subtotal = 0;
      let igv = 0;
      let total = 0;

      if (hasIgv) {
        subtotal = Number(r?.subtotal ?? 0);
        igv = Number(r?.igv ?? 0);
        total = Number(r?.total ?? subtotal + igv);
      } else {
        const base = Number(r?.total ?? 0);
        const calc = calcIgv(base);
        subtotal = calc.base;
        igv = calc.igv;
        total = calc.total;
      }

      const montoAbonado = Number(r?.montoAbonado ?? 0);
      const saldoPendiente = Math.max(
        0,
        total - (Number.isFinite(montoAbonado) ? montoAbonado : 0)
      );

      return {
        ...r,
        subtotal,
        igv,
        total,
        saldoPendiente,
      };
    });
  }

  async function listCotizacionesByCliente(id, estado) {
  const num = Number(id);
  if (!Number.isFinite(num) || num <= 0) {
    const err = new Error("idCliente invalido");
    err.status = 400;
    throw err;
  }
  const filtroEstado =
    typeof estado === "string" && estado.trim() ? estado.trim() : null;
  const rows = await cotizacionRepo.listByClienteId(num, { estado: filtroEstado });
  return rows;
}

async function listEstadosCliente() {
  return repo.listEstados();
}

async function changeEstado(idCliente, estadoClienteId) {
  const id = assertPositiveInt(idCliente, "idCliente");
  const estadoId = assertPositiveInt(estadoClienteId, "estadoClienteId");

  const estado = await repo.findEstadoById(estadoId);
  if (!estado) {
    const err = new Error("Estado de cliente no existe.");
    err.status = 404;
    throw err;
  }

  const updated = await repo.updateEstado(id, estadoId);
  const normalized = Array.isArray(updated) ? updated[0] : updated;
  if (!normalized) {
    const err = new Error(`Cliente con id ${id} no encontrado`);
    err.status = 404;
    throw err;
  }
  return normalized;
}

module.exports = {
  list,
  findById,
  findByDoc,
  create,
  update,
  autocomplete,
  listPedidosByCliente,
  listCotizacionesByCliente,
  listEstadosCliente,
  changeEstado,
};

