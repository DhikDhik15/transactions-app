const express = require('express');
const {
  createTransaction,
  listTransactions,
} = require('../controllers/transactionController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/transaction', auth, createTransaction);
router.get('/transaction/history', auth, listTransactions);

module.exports = router;
