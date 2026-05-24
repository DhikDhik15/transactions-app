const { Sequelize } = require('sequelize');

module.exports = {
  async up(queryInterface, DataTypes, transaction) {
    await queryInterface.createTable(
      'wallet_transactions',
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
        type: {
          type: DataTypes.ENUM('TOPUP', 'PAYMENT', 'REFUND', 'ADJUSTMENT'),
          allowNull: false,
        },
        invoice_number: {
          type: DataTypes.STRING(80),
          allowNull: false,
          unique: true,
        },
        amount: {
          type: DataTypes.DECIMAL(15, 2),
          allowNull: false,
        },
        balance_before: {
          type: DataTypes.DECIMAL(15, 2),
          allowNull: false,
        },
        balance_after: {
          type: DataTypes.DECIMAL(15, 2),
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED'),
          allowNull: false,
          defaultValue: 'SUCCESS',
        },
        description: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        reference_type: {
          type: DataTypes.STRING(80),
          allowNull: true,
        },
        reference_id: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        external_reference: {
          type: DataTypes.STRING(120),
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

    await queryInterface.addIndex('wallet_transactions', ['user_id'], {
      name: 'wallet_transactions_user_id_index',
      transaction,
    });
    await queryInterface.addIndex('wallet_transactions', ['type'], {
      name: 'wallet_transactions_type_index',
      transaction,
    });
  },

  async down(queryInterface, DataTypes, transaction) {
    await queryInterface.dropTable('wallet_transactions', { transaction });
  },
};
