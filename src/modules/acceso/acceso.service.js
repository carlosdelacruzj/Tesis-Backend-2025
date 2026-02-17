const repo = require("./acceso.repository");

function toPositiveInt(value, field) {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) {
    const err = new Error(`${field} invalido`);
    err.status = 400;
    throw err;
  }
  return num;
}

function toPerfilCodigo(value) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

function toPerfilNombre(value) {
  return typeof value === "string" ? value.trim() : "";
}

function toDescripcion(value) {
  if (value == null) return null;
  const text = String(value).trim();
  return text.length ? text : null;
}

async function listPerfiles() {
  const rows = await repo.listPerfiles();
  return rows.map((r) => ({
    idPerfil: r.idPerfil,
    codigo: r.codigo,
    nombre: r.nombre,
    descripcion: r.descripcion ?? null,
    activo: Number(r.activo) === 1,
  }));
}

async function createPerfil(payload = {}) {
  const codigo = toPerfilCodigo(payload.codigo);
  const nombre = toPerfilNombre(payload.nombre);
  const descripcion = toDescripcion(payload.descripcion);
  const activo = payload.activo === undefined ? true : Boolean(payload.activo);

  if (!codigo) {
    const err = new Error("codigo es requerido");
    err.status = 400;
    throw err;
  }
  if (!nombre) {
    const err = new Error("nombre es requerido");
    err.status = 400;
    throw err;
  }

  const exists = await repo.getPerfilByCodigo(codigo);
  if (exists) {
    const err = new Error("Ya existe un perfil con ese codigo");
    err.status = 409;
    throw err;
  }

  const perfilId = await repo.createPerfil({
    codigo,
    nombre,
    descripcion,
    activo,
  });

  return {
    message: "Perfil creado",
    perfil: {
      idPerfil: perfilId,
      codigo,
      nombre,
      descripcion,
      activo,
    },
  };
}

async function updatePerfil(perfilCodigo, payload = {}) {
  const codigo = toPerfilCodigo(perfilCodigo);
  if (!codigo) {
    const err = new Error("perfilCodigo es requerido");
    err.status = 400;
    throw err;
  }

  const perfil = await repo.getPerfilByCodigo(codigo);
  if (!perfil) {
    const err = new Error("Perfil no encontrado");
    err.status = 404;
    throw err;
  }

  const nombre = toPerfilNombre(payload.nombre);
  if (!nombre) {
    const err = new Error("nombre es requerido");
    err.status = 400;
    throw err;
  }
  const descripcion = toDescripcion(payload.descripcion);

  await repo.updatePerfilById(perfil.idPerfil, { nombre, descripcion });

  return {
    message: "Perfil actualizado",
    perfil: {
      idPerfil: perfil.idPerfil,
      codigo: perfil.codigo,
      nombre,
      descripcion,
      activo: Number(perfil.activo) === 1,
    },
  };
}

async function setPerfilEstado(perfilCodigo, payload = {}) {
  const codigo = toPerfilCodigo(perfilCodigo);
  if (!codigo) {
    const err = new Error("perfilCodigo es requerido");
    err.status = 400;
    throw err;
  }
  if (typeof payload.activo !== "boolean") {
    const err = new Error("activo (boolean) es requerido");
    err.status = 400;
    throw err;
  }

  const perfil = await repo.getPerfilByCodigo(codigo);
  if (!perfil) {
    const err = new Error("Perfil no encontrado");
    err.status = 404;
    throw err;
  }

  await repo.setPerfilEstadoById(perfil.idPerfil, payload.activo);

  return {
    message: payload.activo ? "Perfil activado" : "Perfil desactivado",
    perfil: {
      idPerfil: perfil.idPerfil,
      codigo: perfil.codigo,
      nombre: perfil.nombre,
      activo: payload.activo,
    },
  };
}

async function listPerfilesUsuario(usuarioId) {
  const idUsuario = toPositiveInt(usuarioId, "usuarioId");
  const usuario = await repo.getUsuarioById(idUsuario);
  if (!usuario) {
    const err = new Error("Usuario no encontrado");
    err.status = 404;
    throw err;
  }

  const perfiles = await repo.listPerfilesByUsuario(idUsuario);
  return {
    usuario: {
      usuarioId: usuario.usuarioId,
      correo: usuario.correo,
    },
    perfiles: perfiles.map((p) => ({
      idPerfil: p.idPerfil,
      codigo: p.codigo,
      nombre: p.nombre,
      principal: Number(p.principal) === 1,
      activo: Number(p.activo) === 1,
    })),
  };
}

async function assignPerfilUsuario(usuarioId, payload = {}) {
  const idUsuario = toPositiveInt(usuarioId, "usuarioId");
  const usuario = await repo.getUsuarioById(idUsuario);
  if (!usuario) {
    const err = new Error("Usuario no encontrado");
    err.status = 404;
    throw err;
  }

  let perfil = null;
  if (payload.perfilId != null) {
    const idPerfil = toPositiveInt(payload.perfilId, "perfilId");
    perfil = await repo.getPerfilById(idPerfil);
  } else {
    const codigo = toPerfilCodigo(payload.perfilCodigo);
    if (!codigo) {
      const err = new Error("perfilId o perfilCodigo es requerido");
      err.status = 400;
      throw err;
    }
    perfil = await repo.getPerfilByCodigo(codigo);
  }

  if (!perfil) {
    const err = new Error("Perfil no encontrado");
    err.status = 404;
    throw err;
  }
  if (Number(perfil.activo) !== 1) {
    const err = new Error("No se puede asignar un perfil inactivo");
    err.status = 400;
    throw err;
  }

  const principal = Number(payload.principal) === 1 || payload.principal === true;
  await repo.upsertUsuarioPerfil({
    usuarioId: idUsuario,
    perfilId: perfil.idPerfil,
    principal,
  });

  return {
    message: "Perfil asignado",
    usuarioId: idUsuario,
    perfil: {
      idPerfil: perfil.idPerfil,
      codigo: perfil.codigo,
      nombre: perfil.nombre,
    },
    principal,
  };
}

async function removePerfilUsuario(usuarioId, perfilCodigo) {
  const idUsuario = toPositiveInt(usuarioId, "usuarioId");
  const usuario = await repo.getUsuarioById(idUsuario);
  if (!usuario) {
    const err = new Error("Usuario no encontrado");
    err.status = 404;
    throw err;
  }

  const codigo = toPerfilCodigo(perfilCodigo);
  if (!codigo) {
    const err = new Error("perfilCodigo es requerido");
    err.status = 400;
    throw err;
  }

  const perfil = await repo.getPerfilByCodigo(codigo);
  if (!perfil) {
    const err = new Error("Perfil no encontrado");
    err.status = 404;
    throw err;
  }

  await repo.deactivateUsuarioPerfil({
    usuarioId: idUsuario,
    perfilId: perfil.idPerfil,
  });

  return {
    message: "Perfil removido",
    usuarioId: idUsuario,
    perfil: {
      idPerfil: perfil.idPerfil,
      codigo: perfil.codigo,
      nombre: perfil.nombre,
    },
  };
}

module.exports = {
  listPerfiles,
  createPerfil,
  updatePerfil,
  setPerfilEstado,
  listPerfilesUsuario,
  assignPerfilUsuario,
  removePerfilUsuario,
};
