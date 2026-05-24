const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class WalletTransaction extends Model {}

WalletTransaction.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    type: {
      type: DataTypes.ENUM('TOPUP', 'PAYMENT', 'REFUND', 'ADJUSTMENT'),
      allowNull: false,
    },
    invoiceNumber: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true,
      field: 'invoice_number',
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    balanceBefore: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: 'balance_before',
    },
    balanceAfter: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: 'balance_after',
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
    referenceType: {
      type: DataTypes.STRING(80),
      allowNull: true,
      field: 'reference_type',
    },
    referenceId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'reference_id',
    },
    externalReference: {
      type: DataTypes.STRING(120),
      allowNull: true,
      field: 'external_reference',
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'WalletTransaction',
    tableName: 'wallet_transactions',
  }
);

module.exports = WalletTransaction;
