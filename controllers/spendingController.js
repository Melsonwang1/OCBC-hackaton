const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const Users = require('../models/user'); // Adjust the path as needed
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

const sql = require("mssql");
const dbConfig = require("../dbConfig"); // Ensure you have this file configured properly

const saveLimits = async (req, res) => {
    try {
        await sql.connect(dbConfig);
        const { user_id, category, limit } = req.body;

        if (!user_id || !category || !limit) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        await sql.query`
            INSERT INTO SpendingLimits (user_id, category, limit_value)
            VALUES (${user_id}, ${category}, ${limit})
            ON DUPLICATE KEY UPDATE limit_value = ${limit}`;

        res.status(200).json({ message: "Spending limit saved successfully" });
    } catch (error) {
        console.error("Error saving spending limit:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const handleTransaction = async (req, res) => {
    try {
        await sql.connect(dbConfig);
        const { user_id, category, amount } = req.body;

        if (!user_id || !category || !amount) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const result = await sql.query`
            SELECT limit_value
            FROM SpendingLimits
            WHERE user_id = ${user_id} AND category = ${category}`;

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "Spending limit not found" });
        }

        const limit = result.recordset[0].limit_value;

        if (amount > limit) {
            return res.status(200).json({ exceeded: true, excessAmount: amount - limit });
        }

        await sql.query`
            INSERT INTO Transactions (user_id, category, amount)
            VALUES (${user_id}, ${category}, ${amount})`;

        res.status(200).json({ exceeded: false });
    } catch (error) {
        console.error("Error handling transaction:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

const extendLimit = async (req, res) => {  
    try {
        await sql.connect(dbConfig);
        const { user_id, category, excessAmount } = req.body;

        if (!user_id || !category || !excessAmount) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const result = await sql.query`
            SELECT limit_value
            FROM SpendingLimits
            WHERE user_id = ${user_id} AND category = ${category}`;

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "Spending limit not found" });
        }

        const newLimit = result.recordset[0].limit_value + excessAmount;

        await sql.query`
            UPDATE SpendingLimits
            SET limit_value = ${newLimit}
            WHERE user_id = ${user_id} AND category = ${category}`;

        res.status(200).json({ message: "Spending limit extended successfully" });
    } catch (error) {
        console.error("Error extending spending limit:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

const sendSMS = async (req, res) => {
    try {
        await sql.connect(dbConfig);
        const { user_id, message } = req.body;

        if (!user_id || !message) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const result = await sql.query`
            SELECT phone_number
            FROM Users
            WHERE user_id = ${user_id}`;

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const phoneNumber = result.recordset[0].phone_number;

        await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber
        });

        res.status(200).json({ message: "SMS sent successfully" });
    } catch (error) {
        console.error("Error sending SMS:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = { saveLimits };


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