const crypto = require("crypto");

const normalizeForPassword = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z]/g, "")
    .toLowerCase();

const buildInitialPassword = (nombre, apellido) => {
  const first = normalizeForPassword(nombre).slice(0, 3).padEnd(3, "x");
  const last = normalizeForPassword(apellido).slice(0, 3).padEnd(3, "x");
  return `${first}${last}123`;
};

const hashPassword = (plain) =>
  crypto.createHash("sha256").update(String(plain)).digest("hex");

module.exports = {
  normalizeForPassword,
  buildInitialPassword,
  hashPassword,
};
