const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const { database } = require('../src/config/key');

function qid(name) {
  return `\`${String(name).replace(/`/g, '``')}\``;
}

async function main() {
  const conn = await mysql.createConnection(database);
  const dbName = database.database;

  const [tables] = await conn.query(
    `SELECT TABLE_NAME, TABLE_TYPE FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME`,
    [dbName]
  );

  let schemaSql = '';
  schemaSql += `-- Dump schema for ${dbName}\n`;
  schemaSql += `-- Generated at ${new Date().toISOString()}\n\n`;

  for (const t of tables) {
    const name = t.TABLE_NAME;
    if (t.TABLE_TYPE === 'VIEW') {
      const [rows] = await conn.query(`SHOW CREATE VIEW ${qid(name)}`);
      const create = rows?.[0]?.['Create View'] || '';
      if (create) {
        schemaSql += `-- View: ${name}\n`;
        schemaSql += `${create};\n\n`;
      }
    } else {
      const [rows] = await conn.query(`SHOW CREATE TABLE ${qid(name)}`);
      const create = rows?.[0]?.['Create Table'] || '';
      if (create) {
        schemaSql += `-- Table: ${name}\n`;
        schemaSql += `${create};\n\n`;
      }
    }
  }

  const [routines] = await conn.query(
    `SELECT ROUTINE_NAME, ROUTINE_TYPE FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_SCHEMA = ? ORDER BY ROUTINE_TYPE, ROUTINE_NAME`,
    [dbName]
  );

  let procSql = '';
  procSql += `-- Dump routines for ${dbName}\n`;
  procSql += `-- Generated at ${new Date().toISOString()}\n\n`;

  for (const r of routines) {
    const name = r.ROUTINE_NAME;
    const type = r.ROUTINE_TYPE; // PROCEDURE / FUNCTION
    const show = type === 'FUNCTION' ? 'FUNCTION' : 'PROCEDURE';
    const [rows] = await conn.query(`SHOW CREATE ${show} ${qid(name)}`);
    const key = type === 'FUNCTION' ? 'Create Function' : 'Create Procedure';
    const create = rows?.[0]?.[key] || '';
    if (create) {
      procSql += `DELIMITER ;;\n`;
      procSql += `${create};;\n`;
      procSql += `DELIMITER ;\n\n`;
    }
  }

  const dumpDir = path.resolve(process.cwd(), 'dump');
  fs.mkdirSync(dumpDir, { recursive: true });
  fs.writeFileSync(path.join(dumpDir, 'schema_actual.sql'), schemaSql, 'utf8');
  fs.writeFileSync(path.join(dumpDir, 'procedimientos_actual.sql'), procSql, 'utf8');

  await conn.end();
  console.log('Dump completed');
}

main().catch((err) => {
  console.error('Dump error:', err);
  process.exit(1);
});
