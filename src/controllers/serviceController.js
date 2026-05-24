const { Service } = require('../models');
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
    service_icon: service.icon || 'https://nutech-integrasi.app/dummy.jpg',
    service_tariff: toMoney(service.price),
  };
}

const listBanners = asyncHandler(async (req, res) => {
  return sendSuccess(res, 'Sukses', BANNERS);
});

const listServices = asyncHandler(async (req, res) => {
  const services = await Service.findAll({
    where: { isActive: true },
    order: [['createdAt', 'ASC']],
  });

  return sendSuccess(res, 'Sukses', services.map(serializeService));
});

module.exports = {
  listBanners,
  listServices,
  serializeService,
};
