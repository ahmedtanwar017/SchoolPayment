const express = require('express');
const router = express.Router();
const { getAllTransactions } = require('../controllers/transactionController');
const { isAdmin } = require("../middlewares/authMiddleware");

// base: /api/transactions
router.get('/', isAdmin, getAllTransactions);

// for single status check (note base path chosen below)
module.exports = router;
