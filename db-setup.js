const mysql = require('mysql2/promise');

function parseDbUrl(dbUrl) {
  const u = new URL(dbUrl);
  return {
    host: u.hostname,
    port: Number(u.port || 4000),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: (u.pathname || '/sys').replace(/^\//, ''),
    ssl: { rejectUnauthorized: false }
  };
}

async function run() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL não definida no ambiente');
  }

  const conn = await mysql.createConnection(parseDbUrl(dbUrl));

  await conn.query('CREATE DATABASE IF NOT EXISTS terreiro');
  await conn.query('USE terreiro');
  await conn.query(`
    CREATE TABLE IF NOT EXISTS products (
      id BIGINT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      tag VARCHAR(50) DEFAULT '',
      sizes LONGTEXT NOT NULL,
      description TEXT,
      images LONGTEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const [rows] = await conn.query('SELECT DATABASE() AS db, COUNT(*) AS total FROM products');
  console.log(JSON.stringify(rows[0]));

  await conn.end();
}

run().catch((err) => {
  console.error('DB_SETUP_ERROR', err.code || '', err.message);
  process.exit(1);
});
