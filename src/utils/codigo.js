// src/utils/codigo.js
// Helper para generar codigos consistentes: "<PREFIJO>-<id con padding>"
function formatCodigo(prefix, id, width = 6) {
  const n = Number(id);
  if (!Number.isFinite(n) || n <= 0) return null;
  const pfx = (prefix || "").toUpperCase().replace(/[^A-Z0-9_-]/g, "");
  return `${pfx ? `${pfx}-` : ""}${String(n).padStart(width, "0")}`;
}

module.exports = { formatCodigo };
