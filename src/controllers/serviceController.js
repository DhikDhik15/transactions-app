const { queryAll } = require('../database/raw');
const asyncHandler = require('../utils/asyncHandler');
const { toMoney } = require('../utils/money');
const { sendSuccess } = require('../utils/response');

const BANNERS = Array.from({ length: 6 }, (_, index) => ({
  banner_name: `Banner ${index + 1}`,
  banner_image: 'https://nutech-integrasi.app/dummy.jpg',
  description: 'Lerem Ipsum Dolor sit amet',
}));

function serializeService(service) {
  return {
    service_code: service.code,
    service_name: service.name,
    service_icon: service.service_icon || 'https://nutech-integrasi.app/dummy.jpg',
    service_tariff: toMoney(service.service_tariff),
  };
}

const listBanners = asyncHandler(async (req, res) => {
  return sendSuccess(res, 'Sukses', BANNERS);
});

const listServices = asyncHandler(async (req, res) => {
  const services = await queryAll(
    `SELECT code, name, service_icon, service_tariff
    FROM services
    WHERE is_active = ?
    ORDER BY created_at ASC`,
    [1]
  );

  return sendSuccess(res, 'Sukses', services.map(serializeService));
});

module.exports = {
  listBanners,
  listServices,
  serializeService,
};
