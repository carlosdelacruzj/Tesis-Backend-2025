// src/key.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');

function loadCa() {
  // 1) Intentar por contenido embebido (útil para Cloud Run/Secret Manager)
  const raw = process.env.AIVEN_CA_PEM_CONTENT;
  if (raw && raw.trim()) {
    const ca = raw.includes('\\n') ? raw.replace(/\\n/g, '\n') : raw;
    console.log('[DB] SSL: usando AIVEN_CA_PEM_CONTENT');
    return { ca };
  }

  // 2) Intentar por ruta explícita
  const p = (process.env.AIVEN_CA_PEM_PATH || '').trim();
  if (p) {
    try {
      const abs = path.isAbsolute(p) ? p : path.resolve(process.cwd(), p);
      const ca = fs.readFileSync(abs, 'utf8');
      console.log('[DB] SSL: usando AIVEN_CA_PEM_PATH ->', abs);
      return { ca };
    } catch (e) {
      console.warn(`[DB] WARN: No se pudo leer AIVEN_CA_PEM_PATH (${p}): ${e.message}`);
    }
  }

  // 3) Fallback: ./certs/aiven-ca.pem relativo al proyecto
  try {
    const fallback = path.resolve(__dirname, '..', 'certs', 'aiven-ca.pem');
    const ca = fs.readFileSync(fallback, 'utf8');
    console.log('[DB] SSL: usando fallback ./certs/aiven-ca.pem ->', fallback);
    return { ca };
  } catch {
    console.warn('[DB] WARN: No se encontró certs/aiven-ca.pem');
    return undefined;
  }
}

const cfg = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: loadCa(),
};

// Log de sanidad (sin password)
console.log('[DB] host:', cfg.host, 'port:', cfg.port, 'db:', cfg.database, 'ssl:', !!cfg.ssl);

module.exports = { database: cfg };
