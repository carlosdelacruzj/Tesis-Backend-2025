// src/modules/cliente/cliente.service.js
const repo = require("./cliente.repository");

// aquí puedes validar/normalizar datos mínimamente
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

  const data = await repo.getById(num);

  if (!data || data.length === 0) {
    const err = new Error(`Cliente con id ${num} no encontrado`);
    err.status = 404;
    throw err;
  }

  return data;
}

async function findByDoc(doc) {
  assertString(doc, "doc");
  const data = await repo.getByDoc(doc.trim());
  return data;
}

async function create(payload) {
  // valida lo mínimo para no romper tu SP
  ["nombre", "apellido", "correo", "numDoc", "celular", "direccion"].forEach(
    (f) => assertString(payload[f], f)
  );
  await repo.create(payload);
  return { Status: "Registro exitoso" }; // igual que tu respuesta actual (201)
}

async function update(payload) {
  const { idCliente, correo, celular, direccion } = payload;

  const idNum = Number(idCliente);
  if (idCliente == null || Number.isNaN(idNum) || idNum <= 0) {
    const err = new Error("idCliente es requerido");
    err.status = 400;
    throw err;
  }

  // ⬇️ incluye direccion en la regla
  if (!correo && !celular && !direccion) {
    const err = new Error(
      "al menos uno de [correo, celular, direccion] es requerido"
    );
    err.status = 400;
    throw err;
  }

  await repo.updateById({ idCliente: idNum, correo, celular, direccion });
  return { Status: "Actualizacion exitosa" };
}

/* =========================
   NUEVO: Autocomplete
   ========================= */
async function autocomplete({ query, limit = 10 }) {
  assertString(query, "query");
  const q = query.trim();
  if (q.length < 2) {
    const err = new Error("query debe tener al menos 2 caracteres");
    err.status = 400;
    throw err;
  }
  const lim = Number.isFinite(Number(limit)) ? Number(limit) : 10;
  return repo.autocomplete({ query: q, limit: lim });
}

module.exports = {
  list,
  findById,
  findByDoc,
  create,
  update,
  autocomplete, // <-- exporta el nuevo método
};
