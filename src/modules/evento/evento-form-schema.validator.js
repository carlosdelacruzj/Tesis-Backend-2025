const ALLOWED_TYPES = new Set([
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

function parseSchemaRaw(raw) {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw;
  if (Buffer.isBuffer(raw)) {
    try {
      return JSON.parse(raw.toString("utf8"));
    } catch (_err) {
      return [];
    }
  }
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch (_err) {
      return [];
    }
  }
  return [];
}

function normalizeSchema(schema) {
  if (!Array.isArray(schema)) return [];
  return schema
    .map((f) => {
      if (!f || typeof f !== "object" || Array.isArray(f)) return null;
      const key = String(f.key || "").trim();
      const type = String(f.type || "")
        .trim()
        .toLowerCase();
      if (!key || !ALLOWED_TYPES.has(type)) return null;
      return {
        key,
        type,
        required: Boolean(f.required),
        active: f.active === undefined ? true : Boolean(f.active),
        options: Array.isArray(f.options)
          ? f.options.map((o) => String(o || "").trim()).filter(Boolean)
          : [],
      };
    })
    .filter(Boolean);
}

function isEmptyValue(value) {
  if (value == null) return true;
  if (typeof value === "string") return value.trim() === "";
  return false;
}

function assertTypeValue(value, field) {
  const { key, type, options } = field;
  if (value == null) return;

  if (type === "text" || type === "textarea") {
    if (typeof value !== "string") {
      badRequest(`datosEvento.${key} debe ser texto`);
    }
    return;
  }

  if (type === "number") {
    const n = Number(value);
    if (!Number.isFinite(n)) {
      badRequest(`datosEvento.${key} debe ser numero`);
    }
    return;
  }

  if (type === "date") {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
      badRequest(`datosEvento.${key} debe ser fecha YYYY-MM-DD`);
    }
    return;
  }

  if (type === "checkbox") {
    if (typeof value !== "boolean") {
      badRequest(`datosEvento.${key} debe ser boolean`);
    }
    return;
  }

  if (type === "select") {
    const val = String(value ?? "").trim();
    if (!val) {
      badRequest(`datosEvento.${key} invalido`);
    }
    if (!options.includes(val)) {
      badRequest(`datosEvento.${key} no coincide con opciones permitidas`);
    }
  }
}

function validateDatosEventoAgainstSchema({
  schemaRaw,
  datosEvento,
  fieldPath = "datosEvento",
}) {
  const schema = normalizeSchema(parseSchemaRaw(schemaRaw));
  if (!schema.length) return { normalizedSchema: schema, normalizedData: datosEvento ?? null };

  if (datosEvento == null) {
    const requiredField = schema.find((f) => f.active && f.required);
    if (requiredField) {
      badRequest(`${fieldPath}.${requiredField.key} es requerido`);
    }
    return { normalizedSchema: schema, normalizedData: null };
  }

  if (typeof datosEvento !== "object" || Array.isArray(datosEvento)) {
    badRequest(`${fieldPath} debe ser un objeto JSON`);
  }

  for (const field of schema) {
    if (!field.active) continue;
    const value = datosEvento[field.key];
    if (field.required && isEmptyValue(value)) {
      badRequest(`${fieldPath}.${field.key} es requerido`);
    }
    if (!isEmptyValue(value)) {
      assertTypeValue(value, field);
    }
  }

  return { normalizedSchema: schema, normalizedData: datosEvento };
}

module.exports = {
  parseSchemaRaw,
  validateDatosEventoAgainstSchema,
};

