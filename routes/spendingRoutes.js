const express = require('express');
const router = express.Router();
const spendingController = require('../controllers/spendingController');

// Route to save the spending limit
router.post('/save-limit', spendingController.saveLimit);

// Route to send SMS notification
router.post('/send-sms', spendingController.sendSMS);

// Route to handle SMS response
router.post('/handle-response', spendingController.handleResponse);

module.exports = router;
