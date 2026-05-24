require('dotenv').config({ quiet: true });

const mysql = require('mysql2/promise');

let pool;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT || 3306),
      database: process.env.DB_NAME || 'transactions_app',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      timezone: process.env.DB_TIMEZONE || '+07:00',
      waitForConnections: true,
      connectionLimit: Number(process.env.DB_POOL_LIMIT || 10),
    });
  }

  return pool;
}

async function executePrepared(sql, params = [], options = {}) {
  const executor = options.connection || getPool();
  const [rows] = await executor.execute(sql, params);
  return rows;
}

async function queryAll(sql, params = [], options = {}) {
  return executePrepared(sql, params, options);
}

async function queryOne(sql, params = [], options = {}) {
  const rows = await queryAll(sql, params, options);
  return rows[0] || null;
}

async function withTransaction(callback) {
  const connection = await getPool().getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  executePrepared,
  getPool,
  queryAll,
  queryOne,
  withTransaction,
};
