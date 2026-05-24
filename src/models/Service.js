const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Service extends Model {}

Service.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
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
    icon: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'service_icon',
    },
    price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: 'service_tariff',
    },
    adminFee: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'admin_fee',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
  },
  {
    sequelize,
    modelName: 'Service',
    tableName: 'services',
  }
);

module.exports = Service;
