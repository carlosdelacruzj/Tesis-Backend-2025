const fs = require('fs');
const path = require('path');
require('dotenv').config();
const mysql = require('mysql2/promise');
const { database } = require('../src/config/key');

function escId(id) {
  return '`' + String(id).replace(/`/g, '``') + '`';
}

(async () => {
  const conn = await mysql.createConnection(database);
  const lines = [];
  lines.push(`-- Snapshot schema + SPs`);
  lines.push(`-- Generated at ${new Date().toISOString()}`);
  lines.push('');

  const [tables] = await conn.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE' ORDER BY table_name"
  );
  for (const row of tables) {
    const table = row.TABLE_NAME || row.table_name;
    const [ddlRows] = await conn.query(`SHOW CREATE TABLE ${escId(table)}`);
    const ddl = ddlRows[0]['Create Table'];
    lines.push(`-- Table: ${table}`);
    lines.push(ddl + ';');
    lines.push('');
  }

  const [procs] = await conn.query(
    "SELECT routine_name FROM information_schema.routines WHERE routine_schema = DATABASE() AND routine_type = 'PROCEDURE' ORDER BY routine_name"
  );
  for (const row of procs) {
    const name = row.ROUTINE_NAME || row.routine_name;
    const [ddlRows] = await conn.query(`SHOW CREATE PROCEDURE ${escId(name)}`);
    const ddl = ddlRows[0]['Create Procedure'];
    lines.push(`-- Procedure: ${name}`);
    lines.push(`DROP PROCEDURE IF EXISTS ${escId(name)};`);
    lines.push('DELIMITER ;;');
    lines.push(ddl + ';;');
    lines.push('DELIMITER ;');
    lines.push('');
  }

  await conn.end();
  const dt = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const stamp = `${dt.getFullYear()}${pad(dt.getMonth()+1)}${pad(dt.getDate())}_${pad(dt.getHours())}${pad(dt.getMinutes())}${pad(dt.getSeconds())}`;
  const outPath = path.resolve(__dirname, `../dump/backup_schema_sps_${stamp}.sql`);
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
  console.log('Wrote', outPath);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
