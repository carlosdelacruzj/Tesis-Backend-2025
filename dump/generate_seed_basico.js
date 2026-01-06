const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const tables = [
  'T_Estado_Cliente',
  'T_Estado_Empleado',
  'T_Estado_Equipo',
  'T_Estado_Pago',
  'T_Estado_Pedido',
  'T_Estado_Proyecto',
  'T_Estado_voucher',
  'T_Metodo_Pago',
  'T_Servicios',
  'T_Eventos',
  'T_EventoServicioCategoria',
  'T_EventoServicioEstado',
  'T_Tipo_Empleado',
  'T_Tipo_Equipo',
  'T_Marca',
  'T_Modelo',
  'T_Usuario',
  'T_Cliente',
  'T_Empleados',
  'T_Equipo',
  'T_EventoServicio',
  'T_EventoServicioEquipo',
  'T_EventoServicioStaff'
];

function pad(num) {
  return String(num).padStart(2, '0');
}

function formatDate(value) {
  const year = value.getFullYear();
  const month = pad(value.getMonth() + 1);
  const day = pad(value.getDate());
  const hours = pad(value.getHours());
  const mins = pad(value.getMinutes());
  const secs = pad(value.getSeconds());
  return `${year}-${month}-${day} ${hours}:${mins}:${secs}`;
}

function escapeString(value) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "''")
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t');
}

function sqlValue(value) {
  if (value === null || value === undefined) return 'NULL';
  if (Buffer.isBuffer(value)) return `X'${value.toString('hex')}'`;
  if (value instanceof Date) return `'${formatDate(value)}'`;
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL';
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'boolean') return value ? '1' : '0';
  return `'${escapeString(String(value))}'`;
}

async function run() {
  const {
    DB_HOST,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    DB_PORT,
    AIVEN_CA_PEM_PATH
  } = process.env;

  if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
    throw new Error('Faltan variables de entorno de DB en .env');
  }

  const ssl = AIVEN_CA_PEM_PATH
    ? { ca: fs.readFileSync(path.resolve(AIVEN_CA_PEM_PATH)) }
    : undefined;

  const connection = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT ? Number(DB_PORT) : 3306,
    ssl
  });

  const output = [];
  output.push('-- Seed basico generado desde la BD actual');
  output.push(`-- Fecha: ${new Date().toISOString()}`);
  output.push('');
  output.push('SET FOREIGN_KEY_CHECKS=0;');

  for (const table of tables) {
    const [rows, fields] = await connection.query(`SELECT * FROM \`${table}\``);
    if (!rows.length) continue;

    const columns = fields.map((f) => `\`${f.name}\``).join(', ');
    const values = rows.map((row) => {
      const rowValues = fields.map((f) => sqlValue(row[f.name]));
      return `(${rowValues.join(', ')})`;
    });

    output.push('');
    output.push(`-- ${table}`);
    output.push(`INSERT INTO \`${table}\` (${columns}) VALUES`);
    output.push(values.join(',\n') + ';');
  }

  output.push('');
  output.push('SET FOREIGN_KEY_CHECKS=1;');

  const outPath = path.resolve('dump', 'seed_basico_actual.sql');
  fs.writeFileSync(outPath, output.join('\n'), 'utf8');

  await connection.end();
  console.log(`Seed generado en ${outPath}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
