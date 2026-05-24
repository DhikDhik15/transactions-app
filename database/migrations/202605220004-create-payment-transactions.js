const { Sequelize } = require('sequelize');

module.exports = {
  async up(queryInterface, DataTypes, transaction) {
    await queryInterface.createTable(
      'payment_transactions',
      {
        id: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        service_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'services',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        invoice_number: {
          type: DataTypes.STRING(80),
          allowNull: false,
          unique: true,
        },
        customer_number: {
          type: DataTypes.STRING(80),
          allowNull: true,
        },
        amount: {
          type: DataTypes.DECIMAL(15, 2),
          allowNull: false,
        },
        admin_fee: {
          type: DataTypes.DECIMAL(15, 2),
          allowNull: false,
          defaultValue: 0,
        },
        total_amount: {
          type: DataTypes.DECIMAL(15, 2),
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED'),
          allowNull: false,
          defaultValue: 'SUCCESS',
        },
        provider_reference: {
          type: DataTypes.STRING(120),
          allowNull: true,
        },
        notes: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        metadata: {
          type: DataTypes.JSON,
          allowNull: true,
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

    await queryInterface.addIndex('payment_transactions', ['user_id'], {
      name: 'payment_transactions_user_id_index',
      transaction,
    });
    await queryInterface.addIndex('payment_transactions', ['service_id'], {
      name: 'payment_transactions_service_id_index',
      transaction,
    });
  },

  async down(queryInterface, DataTypes, transaction) {
    await queryInterface.dropTable('payment_transactions', { transaction });
  },
};
