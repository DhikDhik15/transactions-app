require('dotenv').config({ quiet: true });

const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');

const databaseName = process.env.DB_NAME || 'transactions_app';

const sequelize = new Sequelize(
  databaseName,
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
    timezone: process.env.DB_TIMEZONE || '+07:00',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    define: {
      underscored: true,
      timestamps: true,
    },
  }
);

async function ensureDatabaseExists() {
  if (process.env.DB_CREATE === 'false') {
    return;
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  const escapedDatabaseName = databaseName.replace(/`/g, '``');
  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${escapedDatabaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
  } finally {
    await connection.end();
  }
}

sequelize.ensureDatabaseExists = ensureDatabaseExists;

module.exports = sequelize;
