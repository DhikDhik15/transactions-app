const express = require('express');
const authRoutes = require('./authRoutes');
const serviceRoutes = require('./serviceRoutes');
const transactionRoutes = require('./transactionRoutes');
const walletRoutes = require('./walletRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/', authRoutes);
router.use('/', serviceRoutes);
router.use('/', transactionRoutes);
router.use('/', walletRoutes);

module.exports = router;
