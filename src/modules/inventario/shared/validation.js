// src/modules/inventario/shared/validation.js

function ensurePositiveInt(value, fieldName) {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) {
    const err = new Error(
      `El campo '${fieldName}' debe ser un entero positivo.`
    );
    err.status = 400;
    throw err;
  }
  return num;
}

function ensureTrimmedString(value, fieldName, { maxLength } = {}) {
  if (typeof value !== "string") {
    const err = new Error(`El campo '${fieldName}' es obligatorio.`);
    err.status = 400;
    throw err;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    const err = new Error(`El campo '${fieldName}' no puede estar vacio.`);
    err.status = 400;
    throw err;
  }
  if (maxLength && trimmed.length > maxLength) {
    const err = new Error(
      `El campo '${fieldName}' no puede exceder los ${maxLength} caracteres.`
    );
    err.status = 400;
    throw err;
  }
  return trimmed;
}

module.exports = {
  ensurePositiveInt,
  ensureTrimmedString,
};
