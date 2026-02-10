const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

function loadCa() {
  const raw = process.env.AIVEN_CA_PEM_CONTENT;
  if (raw && raw.trim()) return raw.includes('\\n') ? raw.replace(/\\n/g, '\n') : raw;

  const p = (process.env.AIVEN_CA_PEM_PATH || '').trim();
  if (p) {
    const abs = path.isAbsolute(p) ? p : path.resolve(process.cwd(), p);
    if (fs.existsSync(abs)) return fs.readFileSync(abs, 'utf8');
  }

  const fallback = path.resolve(process.cwd(), 'certs', 'aiven-ca.pem');
  if (fs.existsSync(fallback)) return fs.readFileSync(fallback, 'utf8');
  return null;
}

function qid(id) {
  return `\`${String(id).replace(/`/g, '``')}\``;
}

(async () => {
  const host = process.env.DB_HOST;
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;

  if (!host || !user || !database) throw new Error('Faltan variables DB_HOST/DB_USER/DB_NAME');

  const ca = loadCa();
  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    ssl: ca ? { ca } : undefined,
  });

  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    '_',
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
  ].join('');

  const outDir = path.resolve(process.cwd(), 'docs', 'db', 'backups');
  fs.mkdirSync(outDir, { recursive: true });

  const schemaPath = path.join(outDir, `schema_${database}_${stamp}.sql`);
  const spsPath = path.join(outDir, `sps_${database}_${stamp}.sql`);

  const schemaLines = [
    '-- Schema export',
    `-- Database: ${database}`,
    `-- Generated at: ${now.toISOString()}`,
    'SET FOREIGN_KEY_CHECKS=0;',
    '',
  ];

  const [tables] = await connection.query(
    'SELECT TABLE_NAME, TABLE_TYPE FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_TYPE, TABLE_NAME',
    [database]
  );

  for (const t of tables) {
    if (t.TABLE_TYPE !== 'BASE TABLE') continue;
    const [rows] = await connection.query(`SHOW CREATE TABLE ${qid(database)}.${qid(t.TABLE_NAME)}`);
    const createStmt = rows[0]['Create Table'];
    schemaLines.push(`-- Table: ${t.TABLE_NAME}`);
    schemaLines.push(`DROP TABLE IF EXISTS ${qid(t.TABLE_NAME)};`);
    schemaLines.push(`${createStmt};`);
    schemaLines.push('');
  }

  for (const t of tables) {
    if (t.TABLE_TYPE !== 'VIEW') continue;
    const [rows] = await connection.query(`SHOW CREATE VIEW ${qid(database)}.${qid(t.TABLE_NAME)}`);
    const createStmt = rows[0]['Create View'];
    schemaLines.push(`-- View: ${t.TABLE_NAME}`);
    schemaLines.push(`DROP VIEW IF EXISTS ${qid(t.TABLE_NAME)};`);
    schemaLines.push(`${createStmt};`);
    schemaLines.push('');
  }

  const [triggers] = await connection.query(
    'SELECT TRIGGER_NAME FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA = ? ORDER BY TRIGGER_NAME',
    [database]
  );

  if (triggers.length) {
    schemaLines.push('DELIMITER $$');
    for (const tr of triggers) {
      const [rows] = await connection.query(`SHOW CREATE TRIGGER ${qid(database)}.${qid(tr.TRIGGER_NAME)}`);
      const createStmt = rows[0]['Create Trigger'];
      schemaLines.push(`DROP TRIGGER IF EXISTS ${qid(tr.TRIGGER_NAME)}$$`);
      schemaLines.push(`${createStmt}$$`);
      schemaLines.push('');
    }
    schemaLines.push('DELIMITER ;');
    schemaLines.push('');
  }

  schemaLines.push('SET FOREIGN_KEY_CHECKS=1;');

  const spLines = [
    '-- Stored routines export (procedures/functions)',
    `-- Database: ${database}`,
    `-- Generated at: ${now.toISOString()}`,
    'DELIMITER $$',
    '',
  ];

  const [routines] = await connection.query(
    'SELECT ROUTINE_NAME, ROUTINE_TYPE FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA = ? ORDER BY ROUTINE_TYPE, ROUTINE_NAME',
    [database]
  );

  for (const r of routines) {
    const kind = String(r.ROUTINE_TYPE).toUpperCase();
    const [rows] = await connection.query(
      kind === 'PROCEDURE'
        ? `SHOW CREATE PROCEDURE ${qid(database)}.${qid(r.ROUTINE_NAME)}`
        : `SHOW CREATE FUNCTION ${qid(database)}.${qid(r.ROUTINE_NAME)}`
    );
    const createStmt = kind === 'PROCEDURE' ? rows[0]['Create Procedure'] : rows[0]['Create Function'];

    spLines.push(`-- ${kind}: ${r.ROUTINE_NAME}`);
    spLines.push(`DROP ${kind} IF EXISTS ${qid(r.ROUTINE_NAME)}$$`);
    spLines.push(`${createStmt}$$`);
    spLines.push('');
  }

  spLines.push('DELIMITER ;');

  fs.writeFileSync(schemaPath, schemaLines.join('\n') + '\n', 'utf8');
  fs.writeFileSync(spsPath, spLines.join('\n') + '\n', 'utf8');

  await connection.end();

  console.log(`SCHEMA_FILE=${schemaPath}`);
  console.log(`SPS_FILE=${spsPath}`);
  console.log(`TABLES=${tables.filter(t => t.TABLE_TYPE === 'BASE TABLE').length}`);
  console.log(`VIEWS=${tables.filter(t => t.TABLE_TYPE === 'VIEW').length}`);
  console.log(`ROUTINES=${routines.length}`);
  console.log(`TRIGGERS=${triggers.length}`);
})().catch((err) => {
  console.error(err?.stack || err?.message || String(err));
  process.exit(1);
});
