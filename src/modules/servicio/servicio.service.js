const repo = require("./servicio.repository");

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

async function findById(id) {
  const num = Number(id);
  if (!Number.isFinite(num) || num <= 0) {
    const err = new Error("id inválido");
    err.status = 400;
    throw err;
  }

  const row = await repo.getById(num);   // ← objeto o null
  if (!row) {
    const err = new Error(`Servicio con id ${num} no encontrado`);
    err.status = 404;
    throw err;
  }

  return row;                            // ← devuelve OBJETO
}

async function create(payload) {
  // La tabla solo tiene nombre
  assertString(payload.nombre, "nombre");
  await repo.create(payload);
  return { Status: "Registro exitoso" };
}

async function update(payload) {
  const { idServicio, nombre } = payload;

  const idNum = Number(idServicio);
  if (idServicio == null || Number.isNaN(idNum) || idNum <= 0) {
    const err = new Error("idServicio es requerido");
    err.status = 400;
    throw err;
  }

  if (nombre == null) {
    const err = new Error("al menos uno de [nombre] es requerido");
    err.status = 400;
    throw err;
  }
  assertString(nombre, "nombre");

  await repo.updateById({ idServicio: idNum, nombre });
  return { Status: "Actualizacion exitosa" };
}

module.exports = { list, findById, create, update };
