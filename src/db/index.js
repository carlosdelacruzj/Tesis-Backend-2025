// const mysql = require('mysql2');                 // <-- mysql2
// const { promisify } = require('util');
// const { database } = require('../config/key');

// const pool = mysql.createPool(database);

// pool.getConnection((err, connection) => {
//   if (err) {
//     if (err.code === 'PROTOCOL_CONNECTION_LOST') console.error('DATABASE CONNECTION WAS CLOSED');
//     if (err.code === 'ER_CON_COUNT_ERROR')       console.error('DATABASE HAS TOO MANY CONNECTIONS');
//     if (err.code === 'ECONNREFUSED')             console.error('DATABASE CONNECTION WAS REFUSED');
//   }
//   if (connection) connection.release();
//   console.log('DB is connected');
// });

// pool.query = promisify(pool.query);              // sigue ok con mysql2
// module.exports = pool;


// src/db/index.js
const mysql = require("mysql2/promise");
const { database } = require("../config/key");

// Espera que `database` tenga: { host, port, user, password, database }
const pool = mysql.createPool({
  ...database,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL || 10),
  queueLimit: 0,
  charset: "utf8mb4",
  // Opcionales útiles:
  // decimalNumbers: true,
  // dateStrings: true,   // si prefieres strings en vez de Date
  // namedPlaceholders: true,
});

async function initPing() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log("DB is connected");
  } catch (err) {
    console.error("DB connection error:", err.code || err.message);
  }
}
initPing();

module.exports = pool;
