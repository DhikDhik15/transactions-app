const express = require('express');
const { getBalance, topUp } = require('../controllers/walletController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/balance', auth, getBalance);
router.post('/topup', auth, topUp);

module.exports = router;
