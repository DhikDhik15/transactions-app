require('dotenv').config({ quiet: true });

const { Pool } = require('pg');

let pool;

function getPool() {
  if (!pool) {
    const config = process.env.DATABASE_URL
      ? {
          connectionString: process.env.DATABASE_URL,
          ssl: {
            rejectUnauthorized: false,
          },
        }
      : {
          host: process.env.DB_HOST || '127.0.0.1',
          port: Number(process.env.DB_PORT || 5432),
          database: process.env.DB_NAME || 'transactions_app',
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || '',
          statement_timeout: 30000,
        };

    pool = new Pool({
      ...config,
      max: Number(process.env.DB_POOL_LIMIT || 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  return pool;
}

async function executePrepared(sql, params = [], options = {}) {
  const client = options.connection || getPool();
  const result = await client.query(sql, params);
  return result.rows;
}

async function queryAll(sql, params = [], options = {}) {
  return executePrepared(sql, params, options);
}

async function queryOne(sql, params = [], options = {}) {
  const rows = await queryAll(sql, params, options);
  return rows[0] || null;
}

async function withTransaction(callback) {
  const client = await getPool().connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  executePrepared,
  getPool,
  queryAll,
  queryOne,
  withTransaction,
};
