const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const tableConfigs = [
  { name: 'T_Estado_Cliente', pk: 'PK_ECli_Cod', fks: {} },
  { name: 'T_Estado_Empleado', pk: 'PK_Estado_Emp_Cod', fks: {} },
  { name: 'T_Estado_Equipo', pk: 'PK_EE_Cod', fks: {} },
  { name: 'T_Estado_Pago', pk: 'PK_ESP_Cod', fks: {} },
  { name: 'T_Estado_Pedido', pk: 'PK_EP_Cod', fks: {} },
  { name: 'T_Estado_Proyecto', pk: 'PK_EPro_Cod', fks: {} },
  { name: 'T_Estado_voucher', pk: 'PK_EV_Cod', fks: {} },
  { name: 'T_Metodo_Pago', pk: 'PK_MP_Cod', fks: {} },
  { name: 'T_Servicios', pk: 'PK_S_Cod', fks: {} },
  { name: 'T_Eventos', pk: 'PK_E_Cod', fks: {} },
  { name: 'T_EventoServicioCategoria', pk: 'PK_ESC_Cod', fks: {} },
  { name: 'T_EventoServicioEstado', pk: 'PK_ESE_Cod', fks: {} },
  { name: 'T_Tipo_Empleado', pk: 'PK_Tipo_Emp_Cod', fks: {} },
  { name: 'T_Tipo_Equipo', pk: 'PK_TE_Cod', fks: {} },
  { name: 'T_Marca', pk: 'PK_IMa_Cod', fks: {} },
  { name: 'T_Usuario', pk: 'PK_U_Cod', fks: {} },
  { name: 'T_Modelo', pk: 'PK_IMo_Cod', fks: { FK_IMa_Cod: 'T_Marca', FK_TE_Cod: 'T_Tipo_Equipo' } },
  { name: 'T_Cliente', pk: 'PK_Cli_Cod', fks: { FK_U_Cod: 'T_Usuario', FK_ECli_Cod: 'T_Estado_Cliente' } },
  { name: 'T_Empleados', pk: 'PK_Em_Cod', fks: { FK_U_Cod: 'T_Usuario', FK_Tipo_Emp_Cod: 'T_Tipo_Empleado', FK_Estado_Emp_Cod: 'T_Estado_Empleado' } },
  { name: 'T_Equipo', pk: 'PK_Eq_Cod', fks: { FK_IMo_Cod: 'T_Modelo', FK_EE_Cod: 'T_Estado_Equipo' } },
  { name: 'T_EventoServicio', pk: 'PK_ExS_Cod', fks: { PK_S_Cod: 'T_Servicios', PK_E_Cod: 'T_Eventos', FK_ESC_Cod: 'T_EventoServicioCategoria' } },
  { name: 'T_EventoServicioEquipo', pk: 'PK_ExS_Equipo_Cod', fks: { FK_ExS_Cod: 'T_EventoServicio', FK_TE_Cod: 'T_Tipo_Equipo' } },
  { name: 'T_EventoServicioStaff', pk: 'PK_ExS_Staff_Cod', fks: { FK_ExS_Cod: 'T_EventoServicio' } }
];

const tableByName = new Map(tableConfigs.map((t) => [t.name, t]));

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

  const mappings = new Map();
  const tableRows = new Map();
  const tableFields = new Map();

  for (const table of tableConfigs) {
    const [rows, fields] = await connection.query(`SELECT * FROM \`${table.name}\` ORDER BY \`${table.pk}\``);
    tableRows.set(table.name, rows);
    tableFields.set(table.name, fields);
    const map = new Map();
    rows.forEach((row, index) => {
      map.set(row[table.pk], index + 1);
    });
    mappings.set(table.name, map);
  }

  const output = [];
  output.push('-- Seed basico con IDs normalizados');
  output.push(`-- Fecha: ${new Date().toISOString()}`);
  output.push('');
  output.push('SET FOREIGN_KEY_CHECKS=0;');

  for (const table of tableConfigs) {
    const rows = tableRows.get(table.name);
    const fields = tableFields.get(table.name);
    if (!rows || !rows.length) continue;

    const columns = fields.map((f) => `\`${f.name}\``).join(', ');
    const values = rows.map((row) => {
      const remapped = { ...row };

      const pkMap = mappings.get(table.name);
      remapped[table.pk] = pkMap.get(row[table.pk]);

      for (const [fkField, refTable] of Object.entries(table.fks)) {
        if (row[fkField] === null || row[fkField] === undefined) continue;
        const refMap = mappings.get(refTable);
        if (!refMap || !refMap.has(row[fkField])) {
          throw new Error(`No existe mapping para FK ${table.name}.${fkField} -> ${refTable} (${row[fkField]})`);
        }
        remapped[fkField] = refMap.get(row[fkField]);
      }

      const rowValues = fields.map((f) => sqlValue(remapped[f.name]));
      return `(${rowValues.join(', ')})`;
    });

    output.push('');
    output.push(`-- ${table.name}`);
    output.push(`INSERT INTO \`${table.name}\` (${columns}) VALUES`);
    output.push(values.join(',\n') + ';');
  }

  output.push('');
  output.push('-- Ajusta AUTO_INCREMENT para continuar desde MAX(id)+1');
  for (const table of tableConfigs) {
    output.push(`ALTER TABLE \`${table.name}\` AUTO_INCREMENT = 1;`);
  }
  output.push('');
  output.push('SET FOREIGN_KEY_CHECKS=1;');

  const outPath = path.resolve('dump', 'seed_basico_normalizado.sql');
  fs.writeFileSync(outPath, output.join('\n'), 'utf8');

  await connection.end();
  console.log(`Seed generado en ${outPath}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
