const repo = require("./servicio.repository");

function assertString(v, field) {
  if (typeof v !== "string" || !v.trim()) {
    const err = new Error(`Campo '${field}' es requerido`);
    err.status = 400;
    throw err;
  }
}

async function list() {
  const rows = await repo.getAll();
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => ({
    id: row.id ?? row.PK_S_Cod ?? null,
    nombre: row.nombre ?? row.S_Nombre ?? null,
  }));
}

async function findById(id) {
  const num = Number(id);
  if (!Number.isFinite(num) || num <= 0) {
    const err = new Error("id invalido");
    err.status = 400;
    throw err;
  }

  const row = await repo.getById(num);
  if (!row) {
    const err = new Error(`Servicio con id ${num} no encontrado`);
    err.status = 404;
    throw err;
  }

  return {
    id: row.id ?? row.PK_S_Cod ?? null,
    nombre: row.nombre ?? row.S_Nombre ?? null,
  };
}

async function create(payload) {
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
