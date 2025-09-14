// src/modules/evento/evento.service.js
const repo = require('./evento.repository');

async function findAll() {
  const rows = await repo.getAll();
  return Array.isArray(rows) ? rows : [];
}

async function findById(id) {
  const num = Number(id);
  if (!Number.isFinite(num) || num <= 0) {
    const err = new Error('id inválido');
    err.status = 400;
    throw err;
  }
  const row = await repo.getById(num); // objeto o null
  if (!row) {
    const err = new Error(`Evento con id ${num} no encontrado`);
    err.status = 404;
    throw err;
  }
  return row; // objeto
}

async function create(payload) {
  const nombre = (payload?.nombre ?? '').trim();
  if (!nombre) {
    const err = new Error('nombre es requerido');
    err.status = 400;
    throw err;
  }
  return await repo.create({ nombre });
}

async function update(id, payload) {
  const num = Number(id);
  if (!Number.isFinite(num) || num <= 0) {
    const err = new Error('id inválido');
    err.status = 400;
    throw err;
  }

  const nombre = payload?.nombre?.trim();
  const hasAny = !!nombre;

  if (!hasAny) {
    const err = new Error('Debe enviar al menos un campo para actualizar');
    err.status = 400;
    throw err;
  }

  const updated = await repo.update(num, { nombre });
  if (!updated) {
    const err = new Error(`Evento con id ${num} no encontrado`);
    err.status = 404;
    throw err;
  }
  return updated;
}

module.exports = { findAll, findById, create, update };
