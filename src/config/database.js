require('dotenv').config({ quiet: true });

const { Sequelize } = require('sequelize');

let sequelize;

// Use DATABASE_URL if available (Neon, production)
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    timezone: process.env.DB_TIMEZONE || '+07:00',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    define: {
      underscored: true,
      timestamps: true,
    },
  });
} else {
  // Local development with individual env vars
  sequelize = new Sequelize(
    process.env.DB_NAME || 'transactions_app',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT || 5432),
      dialect: 'postgres',
      timezone: process.env.DB_TIMEZONE || '+07:00',
      logging: process.env.DB_LOGGING === 'true' ? console.log : false,
      define: {
        underscored: true,
        timestamps: true,
      },
    }
  );
}

// Database creation is handled by Neon automatically
async function ensureDatabaseExists() {
  // Neon handles database creation automatically
  // No need to create database manually
  return;
}

sequelize.ensureDatabaseExists = ensureDatabaseExists;

module.exports = sequelize;
