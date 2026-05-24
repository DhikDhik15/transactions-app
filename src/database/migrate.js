require('dotenv').config({ quiet: true });

const fs = require('fs/promises');
const path = require('path');
const { DataTypes, QueryTypes, Sequelize } = require('sequelize');
const sequelize = require('../config/database');

const MIGRATIONS_DIR = path.resolve(__dirname, '../../database/migrations');
const META_TABLE = 'sequelize_meta';

function normalizeTableName(table) {
  if (typeof table === 'string') {
    return table;
  }

  return table.tableName || table.name;
}

async function ensureMetaTable(queryInterface) {
  const tables = await queryInterface.showAllTables();
  const tableNames = tables.map(normalizeTableName);

  if (tableNames.includes(META_TABLE)) {
    return;
  }

  await queryInterface.createTable(META_TABLE, {
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  });
}

async function getMigrationFiles() {
  const files = await fs.readdir(MIGRATIONS_DIR);
  return files.filter((file) => file.endsWith('.js')).sort();
}

async function getExecutedMigrations() {
  const rows = await sequelize.query(`SELECT name FROM ${META_TABLE} ORDER BY name ASC`, {
    type: QueryTypes.SELECT,
  });

  return rows.map((row) => row.name);
}

function loadMigration(file) {
  const migrationPath = path.join(MIGRATIONS_DIR, file);
  return require(migrationPath);
}

async function recordMigration(file, transaction) {
  await sequelize.query(`INSERT INTO ${META_TABLE} (name) VALUES (:name)`, {
    replacements: { name: file },
    transaction,
  });
}

async function removeMigrationRecord(file, transaction) {
  await sequelize.query(`DELETE FROM ${META_TABLE} WHERE name = :name`, {
    replacements: { name: file },
    transaction,
  });
}

async function migrateUp() {
  const queryInterface = sequelize.getQueryInterface();
  await ensureMetaTable(queryInterface);

  const files = await getMigrationFiles();
  const executed = new Set(await getExecutedMigrations());
  const pending = files.filter((file) => !executed.has(file));

  if (pending.length === 0) {
    console.log('No pending migrations.');
    return;
  }

  for (const file of pending) {
    const migration = loadMigration(file);

    await sequelize.transaction(async (transaction) => {
      await migration.up(queryInterface, DataTypes, transaction);
      await recordMigration(file, transaction);
    });

    console.log(`Migrated: ${file}`);
  }
}

async function migrateDown({ all = false } = {}) {
  const queryInterface = sequelize.getQueryInterface();
  await ensureMetaTable(queryInterface);

  const executed = await getExecutedMigrations();
  const targets = all ? executed.reverse() : executed.slice(-1).reverse();

  if (targets.length === 0) {
    console.log('No migrations to rollback.');
    return;
  }

  for (const file of targets) {
    const migration = loadMigration(file);

    await sequelize.transaction(async (transaction) => {
      await migration.down(queryInterface, DataTypes, transaction);
      await removeMigrationRecord(file, transaction);
    });

    console.log(`Rolled back: ${file}`);
  }
}

async function main() {
  const command = process.argv[2] || 'up';

  await sequelize.ensureDatabaseExists();
  await sequelize.authenticate();

  if (command === 'up') {
    await migrateUp();
  } else if (command === 'down') {
    await migrateDown();
  } else if (command === 'down:all') {
    await migrateDown({ all: true });
  } else {
    throw new Error(`Unknown migration command: ${command}`);
  }
}

main()
  .catch((error) => {
    console.error('Migration failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
