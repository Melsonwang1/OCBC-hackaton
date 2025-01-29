const express = require('express');
const router = express.Router();
const { getPhoneNumber, sendBillReminder } = require('../services/twilioService');

router.post('/get-phone-number', async (req, res) => {
    try {
        const { nric } = req.body;

        if (!nric) {
            return res.status(400).json({ success: false, message: "NRIC is required" });
        }

        const phoneNumber = await getPhoneNumber(nric);
        if (phoneNumber) {
            res.json({ success: true, phoneNumber });
        } else {
            res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (error) {
        console.error('Error in get-phone-number:', error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

router.post('/send-bill-reminder', async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({ success: false, message: "Phone number is required" });
        }

        const smsResult = await sendBillReminder(phoneNumber);
        res.json(smsResult);
    } catch (error) {
        console.error('Error in send-bill-reminder:', error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;
