const { Sequelize } = require('sequelize');

module.exports = {
  async up(queryInterface, DataTypes, transaction) {
    await queryInterface.createTable(
      'users',
      {
        id: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
        },
        first_name: {
          type: DataTypes.STRING(80),
          allowNull: false,
        },
        last_name: {
          type: DataTypes.STRING(80),
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING(160),
          allowNull: false,
          unique: true,
        },
        password_hash: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        profile_image: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        balance: {
          type: DataTypes.DECIMAL(15, 2),
          allowNull: false,
          defaultValue: 0,
        },
        status: {
          type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
          allowNull: false,
          defaultValue: 'ACTIVE',
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      },
      { transaction }
    );
  },

  async down(queryInterface, DataTypes, transaction) {
    await queryInterface.dropTable('users', { transaction });
  },
};
