const sequelize = require('../config/database');
const PaymentTransaction = require('./PaymentTransaction');
const Service = require('./Service');
const User = require('./User');
const WalletTransaction = require('./WalletTransaction');

User.hasMany(WalletTransaction, {
  foreignKey: 'userId',
  as: 'walletTransactions',
});
WalletTransaction.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

User.hasMany(PaymentTransaction, {
  foreignKey: 'userId',
  as: 'paymentTransactions',
});
PaymentTransaction.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

Service.hasMany(PaymentTransaction, {
  foreignKey: 'serviceId',
  as: 'paymentTransactions',
});
PaymentTransaction.belongsTo(Service, {
  foreignKey: 'serviceId',
  as: 'service',
});

async function connectDatabase() {
  await sequelize.ensureDatabaseExists();
  await sequelize.authenticate();

  if (process.env.DB_SYNC === 'true') {
    await sequelize.sync({ alter: process.env.DB_ALTER === 'true' });
  }
}

async function seedServices() {
  if (process.env.SEED_SERVICES === 'false') {
    return;
  }

  const services = [
    { code: 'PAJAK', name: 'Pajak PBB', price: 40000 },
    { code: 'PLN', name: 'Listrik', price: 10000 },
    { code: 'PDAM', name: 'PDAM Berlangganan', price: 40000 },
    { code: 'PULSA', name: 'Pulsa', price: 40000 },
    { code: 'PGN', name: 'PGN Berlangganan', price: 50000 },
    { code: 'MUSIK', name: 'Musik Berlangganan', price: 50000 },
    { code: 'TV', name: 'TV Berlangganan', price: 50000 },
    { code: 'PAKET_DATA', name: 'Paket data', price: 50000 },
    { code: 'VOUCHER_GAME', name: 'Voucher Game', price: 100000 },
    { code: 'VOUCHER_MAKANAN', name: 'Voucher Makanan', price: 100000 },
    { code: 'QURBAN', name: 'Qurban', price: 200000 },
    { code: 'ZAKAT', name: 'Zakat', price: 300000 },
  ];

  await Promise.all(
    services.map(async (service) => {
      const defaults = {
        ...service,
        icon: 'https://nutech-integrasi.app/dummy.jpg',
        adminFee: 0,
        isActive: true,
      };
      const [record, created] = await Service.findOrCreate({
        where: { code: service.code },
        defaults,
      });

      if (!created) {
        await record.update(defaults);
      }
    })
  );
}

module.exports = {
  PaymentTransaction,
  Service,
  User,
  WalletTransaction,
  connectDatabase,
  seedServices,
  sequelize,
};
