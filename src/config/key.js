// src/key.js
require('dotenv').config();         // por si app.js no lo cargó aún
const fs = require('fs');
const path = require('path');

function readCaIfPresent() {
  const p = (process.env.AIVEN_CA_PEM_PATH || '').trim();
  if (!p) return undefined;                     // no intenta leer si está vacío

  try {
    const abs = path.isAbsolute(p) ? p : path.resolve(process.cwd(), p);
    const ca = fs.readFileSync(abs, 'utf8');   // lanza si no existe
    return { ca };
  } catch (e) {
    console.warn(`[DB] WARN: No se pudo leer AIVEN_CA_PEM_PATH (${p}): ${e.message}`);
    return undefined;                           // continúa sin SSL si falla
  }
}

module.exports = {
  database: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: readCaIfPresent()                      // solo si hay CA y se pudo leer
  }
};
