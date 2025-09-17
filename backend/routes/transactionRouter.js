const express = require('express');
const router = express.Router();
const { getAllTransactions } = require('../controllers/transactionController');

// base: /api/transactions
router.get('/', getAllTransactions);

// for single status check (note base path chosen below)
module.exports = router;
