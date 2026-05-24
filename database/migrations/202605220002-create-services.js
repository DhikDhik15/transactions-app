const { Sequelize } = require('sequelize');

module.exports = {
  async up(queryInterface, DataTypes, transaction) {
    await queryInterface.createTable(
      'services',
      {
        id: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
        },
        code: {
          type: DataTypes.STRING(60),
          allowNull: false,
          unique: true,
        },
        name: {
          type: DataTypes.STRING(120),
          allowNull: false,
        },
        service_icon: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        service_tariff: {
          type: DataTypes.DECIMAL(15, 2),
          allowNull: false,
        },
        admin_fee: {
          type: DataTypes.DECIMAL(15, 2),
          allowNull: false,
          defaultValue: 0,
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
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

    await queryInterface.addIndex('services', ['is_active'], {
      name: 'services_is_active_index',
      transaction,
    });
  },

  async down(queryInterface, DataTypes, transaction) {
    await queryInterface.dropTable('services', { transaction });
  },
};
