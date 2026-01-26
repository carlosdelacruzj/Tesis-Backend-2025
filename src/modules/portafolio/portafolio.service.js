// src/modules/portafolio/portafolio.service.js
const fs = require("fs");
const path = require("path");
const repo = require("./portafolio.repository");

function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  throw err;
}

function notFound(message) {
  const err = new Error(message);
  err.status = 404;
  throw err;
}

function assertPositiveInt(value, field) {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) {
    badRequest(`${field} invalido`);
  }
}

function toNullableString(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function parseMostrar(value) {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (typeof value === "boolean") return value ? 1 : 0;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return n ? 1 : 0;
}

function buildPublicUrl(filePath) {
  const rel = path.relative(process.cwd(), filePath);
  return `/${rel.replace(/\\/g, "/")}`;
}

function resolveFilePath(url) {
  const rel = String(url || "").replace(/^[\\/]/, "");
  return path.resolve(rel);
}

async function listEventos() {
  return repo.listEventos();
}

async function updateEventoMostrar(id, mostrar) {
  assertPositiveInt(id, "id");
  const parsed = parseMostrar(mostrar);
  if (parsed === null || parsed === undefined) {
    badRequest("mostrar debe ser 0 o 1");
  }
  const result = await repo.updateEventoMostrar({ id, mostrar: parsed });
  if (!result || result.affectedRows === 0) {
    notFound(`Evento con id ${id} no encontrado`);
  }
  return { Status: "Actualizacion exitosa" };
}

async function listImagenes({ eventoId } = {}) {
  if (eventoId != null && String(eventoId).trim() !== "") {
    assertPositiveInt(eventoId, "eventoId");
  }
  return repo.listImagenes({ eventoId });
}

async function listPublico() {
  const eventos = await repo.listEventos();
  const visibles = (eventos || []).filter((e) => Number(e.mostrarPortafolio) === 1);
  if (!visibles.length) return [];
  const ids = visibles.map((e) => e.id);

  const rows = await repo.listImagenes();
  const imgs = rows.filter((r) => ids.includes(Number(r.eventoId)));

  const byEvento = new Map();
  visibles.forEach((e) => byEvento.set(Number(e.id), { ...e, imagenes: [] }));
  imgs.forEach((img) => {
    const bucket = byEvento.get(Number(img.eventoId));
    if (bucket) bucket.imagenes.push(img);
  });

  return Array.from(byEvento.values());
}

async function createImagenesLote(payload = {}, files = []) {
  const eventoId = payload.eventoId ?? payload.evento ?? payload.fkEvento;
  assertPositiveInt(eventoId, "eventoId");
  if (!Array.isArray(files) || files.length === 0) {
    badRequest("files es requerido");
  }

  const ordenBase = Number(payload.ordenBase || 0);
  const tituloBase = toNullableString(payload.tituloBase);
  const descripcion = toNullableString(payload.descripcion);

  const resultados = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file?.path) continue;
    const url = buildPublicUrl(file.path);
    const titulo = tituloBase ? `${tituloBase} ${i + 1}` : null;
    const orden = ordenBase + i;

    await repo.createImagen({
      eventoId: Number(eventoId),
      url,
      titulo,
      descripcion,
      orden,
    });

    resultados.push({ url, orden });
  }

  return { Status: "Registro masivo exitoso", total: resultados.length };
}

async function updateImagen(id, payload = {}, file) {
  assertPositiveInt(id, "id");
  const current = await repo.getImagenById(id);
  if (!current) notFound(`Imagen ${id} no encontrada`);

  const eventoId =
    payload.eventoId !== undefined ? Number(payload.eventoId) : undefined;
  if (eventoId !== undefined) assertPositiveInt(eventoId, "eventoId");

  const titulo =
    payload.titulo !== undefined ? toNullableString(payload.titulo) : undefined;
  const descripcion =
    payload.descripcion !== undefined
      ? toNullableString(payload.descripcion)
      : undefined;
  const orden = payload.orden !== undefined ? Number(payload.orden) : undefined;

  let url;
  if (file?.path) {
    url = buildPublicUrl(file.path);
  }

  const result = await repo.updateImagen({
    id,
    eventoId,
    url,
    titulo,
    descripcion,
    orden,
  });

  if (!result || result.affectedRows === 0) {
    badRequest("No se pudo actualizar la imagen");
  }

  if (url && current?.url) {
    const prevPath = resolveFilePath(current.url);
    fs.unlink(prevPath, () => {});
  }

  return { Status: "Actualizacion exitosa" };
}

async function deleteImagen(id) {
  assertPositiveInt(id, "id");
  const current = await repo.getImagenById(id);
  if (!current) notFound(`Imagen ${id} no encontrada`);

  const result = await repo.deleteImagen(id);
  if (!result || result.affectedRows === 0) {
    notFound(`Imagen ${id} no encontrada`);
  }

  if (current?.url) {
    const prevPath = resolveFilePath(current.url);
    fs.unlink(prevPath, () => {});
  }

  return { Status: "Eliminacion exitosa" };
}

module.exports = {
  listEventos,
  updateEventoMostrar,
  listImagenes,
  listPublico,
  updateImagen,
  deleteImagen,
  createImagenesLote,
};
