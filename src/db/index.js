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
// src/db/index.js
const mysql = require('mysql2/promise');
const { database } = require("../config/key"); // <-- ajustado el path

const pool = mysql.createPool({
  ...database,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL || 10),
  queueLimit: 0,
  charset: 'utf8mb4',
  // decimalNumbers: true,
  dateStrings: true,
});

pool.on('connection', (conn) => {
  conn.promise()
    .query("SET time_zone = '-05:00'")
    .catch((err) => {
      console.error('DB time_zone error:', err.code || err.message);
    });
});

async function initPing() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('DB is connected');
  } catch (err) {
    // Muestra código típico (ECONNREFUSED, HANDSHAKE_UNKNOWN_CA, etc.)
    console.error('DB connection error:', err.code || err.message);
  }
}
initPing();

module.exports = pool;
