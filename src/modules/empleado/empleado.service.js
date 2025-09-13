// src/modules/empleado/empleado.service.js
const repo = require("./empleado.repository");

function assertString(v, field) {
  if (typeof v !== "string" || !v.trim()) {
    const err = new Error(`Campo '${field}' es requerido`);
    err.status = 400;
    throw err;
  }
}

async function list() {
  return repo.getAll();
}

async function listSimple() {
  return repo.getList();
}

async function listDisponibles(idProyecto) {
  const num = Number(idProyecto);
  if (!Number.isFinite(num) || num <= 0) {
    const err = new Error("idProyecto inválido");
    err.status = 400;
    throw err;
  }
  return repo.getDisponiblesByProyecto(num);
}

async function listCargos() {
  return repo.getCargos();
}

async function findById(id) {
  const num = Number(id);
  if (!Number.isFinite(num) || num <= 0) {
    const err = new Error("id inválido");
    err.status = 400;
    throw err;
  }

  const data = await repo.getById(num);
  if (!data || data.length === 0) {
    const err = new Error(`Empleado con id ${num} no encontrado`);
    err.status = 404;
    throw err;
  }
  return data;
}

async function create(payload) {
  ["nombre", "apellido", "correo", "celular", "doc", "direccion"].forEach(
    (f) => assertString(payload[f], f)
  );

  if (payload.autonomo != null) {
    const a = Number(payload.autonomo);
    if (!Number.isFinite(a) || (a !== 0 && a !== 1)) {
      const err = new Error("autonomo debe ser 0 o 1");
      err.status = 400;
      throw err;
    }
  }

  if (payload.cargo != null) {
    const c = Number(payload.cargo);
    if (!Number.isFinite(c) || c <= 0) {
      const err = new Error("cargo inválido");
      err.status = 400;
      throw err;
    }
  }

  await repo.create(payload);
  return { Status: "Registro exitoso" };
}

async function update(payload) {
  const { idEmpleado, celular, correo, direccion, estado } = payload;

  const idNum = Number(idEmpleado);
  if (idEmpleado == null || Number.isNaN(idNum) || idNum <= 0) {
    const err = new Error("idEmpleado es requerido");
    err.status = 400;
    throw err;
  }

  if (!celular && !correo && !direccion && estado == null) {
    const err = new Error("al menos uno de [correo, celular, direccion, estado] es requerido");
    err.status = 400;
    throw err;
  }

  if (estado != null && (!Number.isFinite(Number(estado)))) {
    const err = new Error("estado inválido");
    err.status = 400;
    throw err;
  }

  await repo.updateById({ idEmpleado: idNum, celular, correo, direccion, estado });
  return { Status: "Actualizacion exitosa" };
}

module.exports = {
  list,
  listSimple,
  listDisponibles,
  listCargos,
  findById,
  create,
  update,
};
