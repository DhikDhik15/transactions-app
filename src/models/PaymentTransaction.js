const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class PaymentTransaction extends Model {}

PaymentTransaction.init(
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
    serviceId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'service_id',
    },
    invoiceNumber: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true,
      field: 'invoice_number',
    },
    customerNumber: {
      type: DataTypes.STRING(80),
      allowNull: true,
      field: 'customer_number',
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    adminFee: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'admin_fee',
    },
    totalAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: 'total_amount',
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED'),
      allowNull: false,
      defaultValue: 'SUCCESS',
    },
    providerReference: {
      type: DataTypes.STRING(120),
      allowNull: true,
      field: 'provider_reference',
    },
    notes: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'PaymentTransaction',
    tableName: 'payment_transactions',
  }
);

module.exports = PaymentTransaction;
