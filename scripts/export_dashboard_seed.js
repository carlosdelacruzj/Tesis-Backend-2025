const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { database } = require('../src/config/key');

function qid(name) {
  return `\`${String(name).replace(/`/g, '``')}\``;
}

async function getTables(conn, dbName) {
  const [rows] = await conn.query(
    `SELECT TABLE_NAME
     FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'
     ORDER BY TABLE_NAME`,
    [dbName]
  );
  return rows.map((r) => r.TABLE_NAME);
}

async function getColumns(conn, dbName, table) {
  const [rows] = await conn.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ?
       AND TABLE_NAME = ?
       AND EXTRA NOT LIKE '%GENERATED%'
     ORDER BY ORDINAL_POSITION`,
    [dbName, table]
  );
  return rows.map((r) => r.COLUMN_NAME);
}

async function getPrimaryKeyColumns(conn, dbName, table) {
  const [rows] = await conn.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
     WHERE TABLE_SCHEMA = ?
       AND TABLE_NAME = ?
       AND CONSTRAINT_NAME = 'PRIMARY'
     ORDER BY ORDINAL_POSITION`,
    [dbName, table]
  );
  return rows.map((r) => r.COLUMN_NAME);
}

async function getAutoIncrement(conn, dbName, table) {
  const [rows] = await conn.query(
    `SELECT AUTO_INCREMENT
     FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
    [dbName, table]
  );
  return rows[0] ? rows[0].AUTO_INCREMENT : null;
}

function formatInsert(table, columns, rows, conn) {
  const colSql = columns.map(qid).join(', ');
  const valuesSql = rows
    .map((row) => {
      const vals = columns.map((c) => conn.escape(row[c]));
      return `(${vals.join(', ')})`;
    })
    .join(',\n');
  return `INSERT INTO ${qid(table)} (${colSql}) VALUES\n${valuesSql};`;
}

(async () => {
  const conn = await mysql.createConnection(database);
  try {
    const dbName = database.database;
    const outPath = path.resolve(process.cwd(), 'docs/db/seed_dashboard_inicio_20260209.sql');
    const now = new Date().toISOString();

    const tables = await getTables(conn, dbName);
    const lines = [];

    lines.push('-- Limpieza total + seed actual (snapshot real de la BD)');
    lines.push(`-- Generado: ${now}`);
    lines.push('-- Archivo regenerado automaticamente desde la BD actual');
    lines.push(`use ${dbName};`);
    lines.push('SET NAMES utf8mb4;');
    lines.push('SET FOREIGN_KEY_CHECKS = 0;');
    lines.push('SET @OLD_SQL_SAFE_UPDATES := @@SQL_SAFE_UPDATES;');
    lines.push('SET SQL_SAFE_UPDATES = 0;');
    lines.push('START TRANSACTION;');
    lines.push('');

    lines.push('-- Limpieza de tablas');
    for (const table of tables) {
      lines.push(`DELETE FROM ${qid(table)};`);
    }
    lines.push('');

    const summary = {};

    for (const table of tables) {
      const columns = await getColumns(conn, dbName, table);
      const pkCols = await getPrimaryKeyColumns(conn, dbName, table);
      const orderBy = pkCols.length ? ` ORDER BY ${pkCols.map(qid).join(', ')}` : '';
      const [rows] = await conn.query(`SELECT * FROM ${qid(table)}${orderBy}`);

      summary[table] = rows.length;

      lines.push(`-- ${table}`);
      if (rows.length === 0) {
        lines.push('-- Sin datos');
      } else {
        const chunkSize = 200;
        for (let i = 0; i < rows.length; i += chunkSize) {
          const chunk = rows.slice(i, i + chunkSize);
          lines.push(formatInsert(table, columns, chunk, conn));
        }
      }

      const autoIncrement = await getAutoIncrement(conn, dbName, table);
      if (autoIncrement !== null) {
        lines.push(`ALTER TABLE ${qid(table)} AUTO_INCREMENT = ${autoIncrement};`);
      }
      lines.push('');
    }

    lines.push('COMMIT;');
    lines.push('SET SQL_SAFE_UPDATES = @OLD_SQL_SAFE_UPDATES;');
    lines.push('SET FOREIGN_KEY_CHECKS = 1;');
    lines.push('');

    fs.writeFileSync(outPath, lines.join('\n'), 'utf8');

    const focus = [
      'T_Cotizacion',
      'T_Pedido',
      'T_PedidoEvento',
      'T_PedidoServicio',
      'T_Proyecto',
      'T_ProyectoDia',
      'T_ProyectoDiaEmpleado',
      'T_ProyectoDiaEquipo',
      'T_ProyectoDiaServicio',
      'T_Voucher'
    ];

    console.log('Seed regenerado en:', outPath);
    console.log('Resumen tablas clave:');
    for (const t of focus) {
      if (Object.prototype.hasOwnProperty.call(summary, t)) {
        console.log(`- ${t}: ${summary[t]}`);
      }
    }
  } finally {
    await conn.end();
  }
})().catch((err) => {
  console.error('Error exportando seed:', err);
  process.exit(1);
});
