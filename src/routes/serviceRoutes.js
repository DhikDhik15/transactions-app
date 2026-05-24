const express = require('express');
const auth = require('../middleware/auth');
const { listBanners, listServices } = require('../controllers/serviceController');

const router = express.Router();

router.get('/banner', listBanners);
router.get('/services', auth, listServices);

module.exports = router;
