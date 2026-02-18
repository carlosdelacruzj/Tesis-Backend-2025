// src/modules/evento/evento.service.js
const repo = require("./evento.repository");
const fs = require("fs");
const path = require("path");
const ALLOWED_FIELD_TYPES = new Set([
  "text",
  "textarea",
  "number",
  "date",
  "select",
  "checkbox",
]);

function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  throw err;
}

function assertPositiveInt(value, field) {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) {
    badRequest(`${field} invalido`);
  }
}

function toNullableString(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function mapEvento(row = {}) {
  let formSchema = row.formSchema ?? row.E_FormSchema ?? null;
  if (typeof formSchema === "string") {
    try {
      formSchema = JSON.parse(formSchema);
    } catch (_err) {
      formSchema = null;
    }
  }
  if (!Array.isArray(formSchema)) formSchema = [];
  return {
    id: row.id ?? row.PK_E_Cod ?? null,
    nombre: row.nombre ?? row.E_Nombre ?? null,
    iconUrl: row.iconUrl ?? row.E_IconUrl ?? null,
    formSchema,
  };
}

function normalizeBool(value, fallback) {
  if (value === undefined) return fallback;
  return Boolean(value);
}

function normalizeOptionalText(value) {
  if (value == null) return null;
  const str = String(value).trim();
  return str ? str : null;
}

function normalizeSchemaField(field, index) {
  if (!field || typeof field !== "object" || Array.isArray(field)) {
    badRequest(`formSchema[${index}] invalido`);
  }

  const key = String(field.key || "").trim();
  const label = String(field.label || "").trim();
  const type = String(field.type || "")
    .trim()
    .toLowerCase();
  const orderRaw = field.order ?? index + 1;
  const order = Number(orderRaw);

  if (!key) badRequest(`formSchema[${index}].key es requerido`);
  if (!/^[a-z][a-z0-9_]*$/.test(key)) {
    badRequest(
      `formSchema[${index}].key invalido (usar snake_case, iniciar con letra)`
    );
  }
  if (!label) badRequest(`formSchema[${index}].label es requerido`);
  if (!ALLOWED_FIELD_TYPES.has(type)) {
    badRequest(
      `formSchema[${index}].type invalido. Permitidos: ${[
        ...ALLOWED_FIELD_TYPES,
      ].join(", ")}`
    );
  }
  if (!Number.isInteger(order) || order <= 0) {
    badRequest(`formSchema[${index}].order invalido`);
  }

  let options = [];
  if (type === "select") {
    if (!Array.isArray(field.options) || field.options.length === 0) {
      badRequest(`formSchema[${index}].options es requerido para type select`);
    }
    options = [...new Set(field.options.map((x) => String(x || "").trim()).filter(Boolean))];
    if (!options.length) {
      badRequest(`formSchema[${index}].options invalido`);
    }
  }

  return {
    key,
    label,
    type,
    required: normalizeBool(field.required, false),
    active: normalizeBool(field.active, true),
    order,
    placeholder: normalizeOptionalText(field.placeholder),
    helpText: normalizeOptionalText(field.helpText),
    options,
  };
}

function normalizeFormSchema(schema) {
  if (!Array.isArray(schema)) {
    badRequest("formSchema debe ser un arreglo");
  }

  const normalized = schema.map((f, i) => normalizeSchemaField(f, i));
  const keySet = new Set();
  for (const field of normalized) {
    if (keySet.has(field.key)) {
      badRequest(`formSchema.key duplicado: ${field.key}`);
    }
    keySet.add(field.key);
  }

  normalized.sort((a, b) => a.order - b.order || a.key.localeCompare(b.key));
  return normalized;
}

function parseFormSchemaInput(value) {
  if (value === undefined) return undefined;
  if (value === null || value === "") return [];
  if (Array.isArray(value)) return normalizeFormSchema(value);
  if (typeof value === "string") {
    const txt = value.trim();
    if (!txt) return [];
    let parsed;
    try {
      parsed = JSON.parse(txt);
    } catch (_err) {
      badRequest("formSchema debe ser JSON valido");
    }
    return normalizeFormSchema(parsed);
  }
  if (typeof value === "object") return normalizeFormSchema(value);
  badRequest("formSchema invalido");
}

function buildPublicUrl(filePath) {
  if (!filePath) return null;
  const rel = path.relative(process.cwd(), filePath);
  return `/${rel.replace(/\\/g, "/")}`;
}

function resolveFilePath(url) {
  const rel = String(url || "").replace(/^[\\/]/, "");
  return path.resolve(rel);
}

async function findAll() {
  const rows = await repo.getAll();
  if (!Array.isArray(rows)) return [];
  return rows.map(mapEvento);
}

async function findById(id) {
  assertPositiveInt(id, "id");
  const row = await repo.getById(Number(id));
  if (!row) {
    const err = new Error(`Evento con id ${id} no encontrado`);
    err.status = 404;
    throw err;
  }
  return mapEvento(row);
}

async function create(payload = {}, file = null) {
  const nombreRaw = typeof payload.nombre === "string" ? payload.nombre : "";
  const nombre = nombreRaw.trim();
  if (!nombre) {
    badRequest("nombre es requerido");
  }
  const iconUrlFromBody = toNullableString(payload.iconUrl);
  const iconUrl = file?.path ? buildPublicUrl(file.path) : iconUrlFromBody;
  const formSchema = parseFormSchemaInput(payload.formSchema);

  if (formSchema !== undefined) {
    await repo.createWithSchema({
      nombre,
      iconUrl,
      formSchema: JSON.stringify(formSchema),
    });
  } else {
    await repo.create({ nombre, iconUrl });
  }
  return { Status: "Registro exitoso" };
}

async function update(id, payload = {}, file = null) {
  assertPositiveInt(id, "id");

  const current = await repo.getById(Number(id));
  if (!current) {
    const err = new Error(`Evento con id ${id} no encontrado`);
    err.status = 404;
    throw err;
  }

  const nombre =
    payload.nombre !== undefined
      ? toNullableString(payload.nombre)
      : undefined;
  const iconUrlBody =
    payload.iconUrl !== undefined ? toNullableString(payload.iconUrl) : undefined;
  const iconUrl = file?.path ? buildPublicUrl(file.path) : iconUrlBody;
  const formSchema = parseFormSchemaInput(payload.formSchema);

  if (nombre === undefined && iconUrl === undefined && formSchema === undefined) {
    badRequest("Debe enviar al menos un campo para actualizar");
  }

  const result = await repo.updateById({
    idEvento: Number(id),
    nombre,
    iconUrl,
    formSchema: formSchema !== undefined ? JSON.stringify(formSchema) : undefined,
  });

  if (!result || result.affectedRows === 0) {
    const err = new Error(`Evento con id ${id} no encontrado`);
    err.status = 404;
    throw err;
  }

  if (file?.path && current?.iconUrl) {
    const prevPath = resolveFilePath(current.iconUrl);
    fs.unlink(prevPath, () => {});
  }

  return { Status: "Actualizacion exitosa" };
}

async function findSchemaById(id) {
  assertPositiveInt(id, "id");
  const row = await repo.getSchemaById(Number(id));
  if (!row) {
    const err = new Error(`Evento con id ${id} no encontrado`);
    err.status = 404;
    throw err;
  }

  let formSchema = row.formSchema ?? row.E_FormSchema ?? [];
  if (typeof formSchema === "string") {
    try {
      formSchema = JSON.parse(formSchema);
    } catch (_err) {
      formSchema = [];
    }
  }
  if (!Array.isArray(formSchema)) formSchema = [];

  return { eventoId: Number(id), formSchema };
}

async function updateSchema(id, payload = {}) {
  assertPositiveInt(id, "id");
  const normalized = normalizeFormSchema(payload.formSchema);

  const result = await repo.updateSchemaById({
    idEvento: Number(id),
    formSchema: JSON.stringify(normalized),
  });

  if (!result || result.affectedRows === 0) {
    const err = new Error(`Evento con id ${id} no encontrado`);
    err.status = 404;
    throw err;
  }

  return { Status: "Schema actualizado", eventoId: Number(id), formSchema: normalized };
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  findSchemaById,
  updateSchema,
};
