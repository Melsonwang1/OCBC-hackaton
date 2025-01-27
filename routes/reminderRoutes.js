const express = require('express');
const router = express.Router();
const { sendBillReminder } = require('../services/twilioService');

router.post('/send-bill-reminder', async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({ success: false, message: 'Phone number is required' });
        }

        // Send SMS via Twilio
        const smsResult = await sendBillReminder(phoneNumber);
        res.json(smsResult);
    } catch (error) {
        console.error('Error in send-bill-reminder:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
