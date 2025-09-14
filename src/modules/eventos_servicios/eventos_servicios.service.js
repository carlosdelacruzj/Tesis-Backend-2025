const repo = require("./eventos_servicios.repository");

function assertPositiveInt(v, field) {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) {
    const err = new Error(`${field} inválido`);
    err.status = 400;
    throw err;
  }
}

async function list({ evento, servicio } = {}) {
  // ambos son opcionales; repo maneja nulls correctamente
  if (evento != null && String(evento).trim() !== "") {
    assertPositiveInt(evento, "evento");
  }
  if (servicio != null && String(servicio).trim() !== "") {
    assertPositiveInt(servicio, "servicio");
  }
  return repo.getAll({ evento, servicio });
}

async function findById(id) {
  assertPositiveInt(id, "id");
  const data = await repo.getById(id);
  if (!data || data.length === 0) {
    const err = new Error(`Registro con id ${id} no encontrado`);
    err.status = 404;
    throw err;
  }
  return data;
}

async function create(payload) {
  const { servicio, evento, precio, descripcion, titulo } = payload;

  assertPositiveInt(servicio, "servicio");
  assertPositiveInt(evento, "evento");

  if (precio != null && !Number.isFinite(Number(precio))) {
    const err = new Error("precio inválido");
    err.status = 400;
    throw err;
  }

  const { insertedId } = await repo.create({ servicio, evento, precio, descripcion, titulo });
  return { Status: "Registro exitoso", insertedId };
}

async function update(payload) {
  const { id, servicio, precio, concepto } = payload;

  assertPositiveInt(id, "id");

  if (servicio == null && precio == null && (concepto == null || String(concepto).trim() === "")) {
    const err = new Error("al menos uno de [servicio, precio, concepto] es requerido");
    err.status = 400;
    throw err;
  }

  if (servicio != null) assertPositiveInt(servicio, "servicio");
  if (precio != null && !Number.isFinite(Number(precio))) {
    const err = new Error("precio inválido");
    err.status = 400;
    throw err;
  }

  await repo.updateById({ id, servicio, precio, concepto });
  return { Status: "Actualizacion exitosa" };
}

module.exports = { list, findById, create, update };
