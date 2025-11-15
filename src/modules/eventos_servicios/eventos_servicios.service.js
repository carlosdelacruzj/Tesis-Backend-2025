const repo = require("./eventos_servicios.repository");

function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  throw err;
}

function assertPositiveInt(value, field) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    badRequest(`${field} inválido`);
  }
}

function ensureOptionalNumber(value, field) {
  if (value == null || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n)) {
    badRequest(`${field} inválido`);
  }
  return n;
}

function ensureOptionalInteger(value, field) {
  if (value == null || value === "") return null;
  const n = Number(value);
  if (!Number.isInteger(n)) {
    badRequest(`${field} debe ser un entero`);
  }
  return n;
}

function ensureOptionalPositiveInteger(value, field) {
  if (value == null || value === "") return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    badRequest(`${field} debe ser un entero positivo`);
  }
  return n;
}

function normalizeOptionalBooleanFlag(value, field) {
  if (value === undefined || value === null || value === "") return null;
  if (
    value === true ||
    value === 1 ||
    value === "1" ||
    String(value).toLowerCase() === "true"
  ) {
    return 1;
  }
  if (
    value === false ||
    value === 0 ||
    value === "0" ||
    String(value).toLowerCase() === "false"
  ) {
    return 0;
  }
  badRequest(`${field} debe ser booleano`);
}

function normalizeStaffInput(staff, { allowUndefined = false } = {}) {
  if (staff === undefined) return allowUndefined ? undefined : [];
  if (staff === null) return [];
  if (!Array.isArray(staff)) {
    badRequest("staff debe ser un arreglo");
  }

  return staff.map((item, index) => {
    if (!item || typeof item !== "object") {
      badRequest(`staff[${index}] debe ser un objeto`);
    }
    const rol =
      typeof item.rol === "string" && item.rol.trim()
        ? item.rol.trim()
        : null;
    if (!rol) {
      badRequest(`staff[${index}].rol es requerido`);
    }
    const cantidad =
      item.cantidad == null || item.cantidad === ""
        ? 0
        : Number(item.cantidad);
    if (!Number.isInteger(cantidad) || cantidad < 0) {
      badRequest(`staff[${index}].cantidad debe ser un entero >= 0`);
    }
    return { rol, cantidad };
  });
}

function normalizeEquiposInput(equipos, { allowUndefined = false } = {}) {
  if (equipos === undefined) return allowUndefined ? undefined : [];
  if (equipos === null) return [];
  if (!Array.isArray(equipos)) {
    badRequest("equipos debe ser un arreglo");
  }

  return equipos.map((item, index) => {
    if (!item || typeof item !== "object") {
      badRequest(`equipos[${index}] debe ser un objeto`);
    }
    const tipoEquipoId =
      item.tipoEquipoId == null || item.tipoEquipoId === ""
        ? null
        : Number(item.tipoEquipoId);
    if (!Number.isInteger(tipoEquipoId) || tipoEquipoId <= 0) {
      badRequest(`equipos[${index}].tipoEquipoId debe ser un entero positivo`);
    }
    const cantidad =
      item.cantidad == null || item.cantidad === ""
        ? 1
        : Number(item.cantidad);
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      badRequest(`equipos[${index}].cantidad debe ser un entero > 0`);
    }
    const notas =
      typeof item.notas === "string" && item.notas.trim()
        ? item.notas.trim()
        : undefined;

    return {
      tipoEquipoId,
      cantidad,
      ...(notas ? { notas } : {}),
    };
  });
}

async function list({ evento, servicio } = {}) {
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

async function create(payload = {}) {
  const {
    servicio,
    evento,
    categoriaId,
    esAddon,
    precio,
    descripcion,
    titulo,
    horas,
    fotosImpresas,
    trailerMin,
    filmMin,
    staff,
    equipos,
  } = payload;

  assertPositiveInt(servicio, "servicio");
  assertPositiveInt(evento, "evento");

  const precioNum = ensureOptionalNumber(precio, "precio");
  const horasNum = ensureOptionalNumber(horas, "horas");
  const fotosNum = ensureOptionalInteger(fotosImpresas, "fotosImpresas");
  const trailerNum = ensureOptionalInteger(trailerMin, "trailerMin");
  const filmNum = ensureOptionalInteger(filmMin, "filmMin");
  const categoriaIdNum = ensureOptionalPositiveInteger(categoriaId, "categoriaId");
  const esAddonFlag = normalizeOptionalBooleanFlag(esAddon, "esAddon");

  const staffList = normalizeStaffInput(staff);
  const equiposList = normalizeEquiposInput(equipos);

  if (!staffList.length) {
    badRequest("staff debe contener al menos un elemento");
  }
  if (!equiposList.length) {
    badRequest("equipos debe contener al menos un elemento");
  }

  const { insertedId } = await repo.create({
    servicio,
    evento,
    categoriaId: categoriaIdNum,
    esAddon: esAddonFlag,
    precio: precioNum,
    descripcion,
    titulo,
    horas: horasNum,
    fotosImpresas: fotosNum,
    trailerMin: trailerNum,
    filmMin: filmNum,
    staff: staffList,
    equipos: equiposList,
  });

  return { Status: "Registro exitoso", insertedId };
}

async function update(payload = {}) {
  const {
    id,
    servicio,
    evento,
    categoriaId,
    esAddon,
    precio,
    descripcion,
    titulo,
    horas,
    fotosImpresas,
    trailerMin,
    filmMin,
    staff,
    equipos,
  } = payload;

  assertPositiveInt(id, "id");

  const fields = [
    servicio,
    evento,
    categoriaId,
    esAddon,
    precio,
    descripcion,
    titulo,
    horas,
    fotosImpresas,
    trailerMin,
    filmMin,
    staff,
    equipos,
  ];

  const hasUpdates = fields.some((value) => value !== undefined);
  if (!hasUpdates) {
    badRequest("Se requiere al menos un campo para actualizar");
  }

  if (servicio !== undefined) assertPositiveInt(servicio, "servicio");
  if (evento !== undefined) assertPositiveInt(evento, "evento");

  const precioNum = ensureOptionalNumber(precio, "precio");
  const horasNum = ensureOptionalNumber(horas, "horas");
  const fotosNum = ensureOptionalInteger(fotosImpresas, "fotosImpresas");
  const trailerNum = ensureOptionalInteger(trailerMin, "trailerMin");
  const filmNum = ensureOptionalInteger(filmMin, "filmMin");
  const categoriaIdNum = ensureOptionalPositiveInteger(categoriaId, "categoriaId");
  const esAddonFlag = normalizeOptionalBooleanFlag(esAddon, "esAddon");

  const staffList = normalizeStaffInput(staff, { allowUndefined: true });
  const equiposList = normalizeEquiposInput(equipos, { allowUndefined: true });

  if (staffList === undefined) {
    badRequest("staff es requerido");
  }
  if (staffList !== undefined && !staffList.length) {
    badRequest("staff debe contener al menos un elemento");
  }
  if (equiposList === undefined) {
    badRequest("equipos es requerido");
  }
  if (equiposList !== undefined && !equiposList.length) {
    badRequest("equipos debe contener al menos un elemento");
  }

  await repo.updateById({
    id,
    servicio,
    evento,
    categoriaId: categoriaIdNum,
    esAddon: esAddonFlag,
    precio: precioNum,
    descripcion,
    titulo,
    horas: horasNum,
    fotosImpresas: fotosNum,
    trailerMin: trailerNum,
    filmMin: filmNum,
    staff: staffList,
    equipos: equiposList,
  });

  return { Status: "Actualización exitosa" };
}

async function listCategorias() {
  return repo.listCategorias();
}

module.exports = { list, findById, create, update, listCategorias };
