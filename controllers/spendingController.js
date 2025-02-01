const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const Users = require('../models/Users'); // Adjust the path as needed
const express = require('express');
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.static('public'));
const port = 5500;

// Save spending limits
app.post('/api/save-limits', async (req, res) => {
  const { phone, limits } = req.body;

  try {
    await Users.setSpendingLimits(phone, limits);
    res.status(200).json({ message: 'Limits saved successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving limits.', error });
  }
});

// Handle transactions
app.post('/api/handle-transaction', async (req, res) => {
  const { phone, category, amountSpent } = req.body;

  try {
    const limits = await Users.getSpendingLimits(phone);
    const limit = limits[category];

    if (amountSpent > limit) {
      const excessAmount = amountSpent - limit;
      res.status(200).json({ exceeded: true, excessAmount });
    } else {
      await Users.addTransaction(phone, category, amountSpent);
      res.status(200).json({ exceeded: false });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error handling transaction.', error });
  }
});

// Extend spending limits
app.post('/api/extend-limit', async (req, res) => {
  const { phone, category, excessAmount } = req.body;

  try {
    await Users.extendLimit(phone, category, excessAmount);
    res.status(200).json({ message: 'Limit extended successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error extending limit.', error });
  }
});

// Send SMS notifications
app.post('/api/send-sms', async (req, res) => {
  const { userId, message } = req.body;

  try {
    const user = await Users.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: user.phoneNumber,
    });

    res.status(200).json({ message: 'SMS sent successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending SMS.', error });
  }
});

// Export all functions
module.exports = {
  saveLimits,
  handleTransaction,
  extendLimit,
  sendSMS,
};