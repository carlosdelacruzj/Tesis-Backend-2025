// src/modules/inventario/equipo/equipo.service.js
const repo = require("./equipo.repository");
const { ensurePositiveInt, ensureTrimmedString } = require("../shared/validation");

const ESTADOS_INHABILITANTES = new Set([12, 13]); // 12: mantenimiento, 13: baja

function normalizeFecha(fecha) {
  if (fecha == null || fecha === "") {
    return null;
  }
  // Permite strings tipo "2025-10-23" o Date; valida formato sencillo.
  const value = typeof fecha === "string" ? fecha.trim() : fecha;
  if (!value) {
    return null;
  }
  const isoPattern = /^\d{4}-\d{2}-\d{2}$/;
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string" && isoPattern.test(value)) {
    return value;
  }
  const err = new Error("La fecha de ingreso debe tener formato YYYY-MM-DD.");
  err.status = 400;
  throw err;
}

function handleRepositoryError(err) {
  if (!err) {
    return;
  }
  if (err.code === "ER_DUP_ENTRY") {
    const custom = new Error("Ya existe un equipo con ese numero de serie.");
    custom.status = 409;
    throw custom;
  }
  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    const custom = new Error("El modelo o el estado indicado no existe.");
    custom.status = 400;
    throw custom;
  }
  if (err.code === "ER_ROW_IS_REFERENCED_2") {
    const custom = new Error("No se puede eliminar el equipo porque esta en uso.");
    custom.status = 409;
    throw custom;
  }
  throw err;
}

async function list() {
  return repo.findAll();
}

async function listByFilters(filters) {
  const parsed = {
    idTipoEquipo:
      filters.idTipoEquipo != null
        ? ensurePositiveInt(filters.idTipoEquipo, "idTipoEquipo")
        : undefined,
    idMarca:
      filters.idMarca != null ? ensurePositiveInt(filters.idMarca, "idMarca") : undefined,
    idModelo:
      filters.idModelo != null
        ? ensurePositiveInt(filters.idModelo, "idModelo")
        : undefined,
  };
  return repo.findByFilters(parsed);
}

async function findById(idEquipo) {
  const id = ensurePositiveInt(idEquipo, "idEquipo");
  const equipo = await repo.findById(id);
  if (!equipo) {
    const err = new Error("El equipo solicitado no existe.");
    err.status = 404;
    throw err;
  }
  return equipo;
}

async function create(payload) {
  const fechaIngreso = normalizeFecha(payload?.fechaIngreso);
  const idModelo = ensurePositiveInt(payload?.idModelo, "idModelo");
  const idEstado = ensurePositiveInt(payload?.idEstado, "idEstado");
  const serie =
    payload?.serie != null && payload.serie !== ""
      ? ensureTrimmedString(payload.serie, "serie", { maxLength: 64 })
      : null;
  try {
    return await repo.create({ fechaIngreso, idModelo, idEstado, serie });
  } catch (err) {
    handleRepositoryError(err);
  }
}

async function update(idEquipo, payload) {
  const id = ensurePositiveInt(idEquipo, "idEquipo");
  const fechaIngreso = normalizeFecha(payload?.fechaIngreso);
  const idModelo = ensurePositiveInt(payload?.idModelo, "idModelo");
  const idEstado = ensurePositiveInt(payload?.idEstado, "idEstado");
  const serie =
    payload?.serie != null && payload.serie !== ""
      ? ensureTrimmedString(payload.serie, "serie", { maxLength: 64 })
      : null;
  try {
    const equipo = await repo.update(id, { fechaIngreso, idModelo, idEstado, serie });
    if (!equipo) {
      const err = new Error("El equipo solicitado no existe.");
      err.status = 404;
      throw err;
    }
    return equipo;
  } catch (err) {
    handleRepositoryError(err);
  }
}

async function remove(idEquipo) {
  const id = ensurePositiveInt(idEquipo, "idEquipo");
  try {
    const deleted = await repo.remove(id);
    if (!deleted) {
      const err = new Error("El equipo solicitado no existe.");
      err.status = 404;
      throw err;
    }
  } catch (err) {
    handleRepositoryError(err);
  }
}

async function summarize() {
  return repo.summarizeByModel();
}

async function listEstados() {
  return repo.findEstados();
}

async function updateEstado(idEquipo, payload) {
  const id = ensurePositiveInt(idEquipo, "idEquipo");
  const idEstado = ensurePositiveInt(payload?.idEstado, "idEstado");
  try {
    const current = await repo.findById(id);
    if (!current) {
      const err = new Error("El equipo solicitado no existe.");
      err.status = 404;
      throw err;
    }
    // Evita reactivar un equipo dado de baja directamente.
    if (current.idEstado === 13 && idEstado === 10) {
      const err = new Error(
        "No se puede cambiar un equipo dado de baja a Disponible. Solicita reactivación manual."
      );
      err.status = 400;
      throw err;
    }
    // Si el estado nuevo es inhabilitante, limpiar asignaciones futuras del equipo
    if (ESTADOS_INHABILITANTES.has(idEstado)) {
      const hoy = new Date().toISOString().slice(0, 10);
      const { equipo, proyectosAfectados } = await repo.inhabilitarEquipo(
        id,
        idEstado,
        hoy
      );
      return { ...equipo, proyectosAfectados: proyectosAfectados || [] };
    }
    const equipo = await repo.updateEstado(id, idEstado);
    return { ...equipo, proyectosAfectados: [] };
  } catch (err) {
    handleRepositoryError(err);
  }
}

async function listProyectosAfectados(idEquipo, { fechaDesde } = {}) {
  const id = ensurePositiveInt(idEquipo, "idEquipo");
  const current = await repo.findById(id);
  if (!current) {
    const err = new Error("El equipo solicitado no existe.");
    err.status = 404;
    throw err;
  }
  const hoy = fechaDesde
    ? normalizeFecha(fechaDesde)
    : new Date().toISOString().slice(0, 10);
  return repo.listProyectosAfectados(id, hoy);
}

module.exports = {
  list,
  listByFilters,
  findById,
  create,
  update,
  remove,
  summarize,
  listEstados,
  updateEstado,
  listProyectosAfectados,
};
