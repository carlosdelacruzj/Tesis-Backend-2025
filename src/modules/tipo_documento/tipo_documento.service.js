const repo = require("./tipo_documento.repository");

async function list() {
  const rows = await repo.listAll();
  return Array.isArray(rows) ? rows : [];
}

module.exports = { list };
