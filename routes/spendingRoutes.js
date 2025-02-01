const express = require('express');
const spendingController = require('../controllers/spendingController');

const router = express.Router();

// API endpoints
router.post('/save-limit', spendingController.saveLimit);
router.post('/handle-transaction', spendingController.handleTransaction);
router.post('/handle-response', spendingController.handleUserResponse);

module.exports = router;