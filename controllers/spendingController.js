const User = require('../models/User');
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Save spending limits
exports.saveLimit = async (req, res) => {
  const { phone, category, newLimit } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { phone },
      { $set: { [`limits.${category}`]: newLimit } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send SMS confirmation
    await client.messages.create({
      body: `Your ${category} limit has been updated to $${newLimit}.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    res.status(200).json({ message: 'Limit updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating limit', error });
  }
};

// Handle transactions
exports.handleTransaction = async (req, res) => {
  const { phone, category, amountSpent } = req.body;

  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const limit = user.limits[category];
    if (amountSpent > limit) {
      const excessAmount = amountSpent - limit;

      // Send SMS to user
      await client.messages.create({
        body: `Exceeded Monthly Limit for ${category} by $${excessAmount}. Do you want to extend the limit and make the transaction now? Reply 'YES' or 'NO'`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });

      res.status(200).json({ message: 'SMS sent to user', excessAmount });
    } else {
      // Proceed with the transaction
      user.transactions.push({ category, amount: amountSpent });
      await user.save();
      res.status(200).json({ message: 'Transaction successful', user });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error handling transaction', error });
  }
};

// Handle user response to SMS
exports.handleUserResponse = async (req, res) => {
  const { phone, category, userResponse, excessAmount } = req.body;

  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userResponse.toUpperCase() === 'YES') {
      // Extend the limit and complete the transaction
      user.limits[category] += excessAmount;
      user.transactions.push({ category, amount: user.limits[category] });
      await user.save();

      res.status(200).json({ message: 'Limit extended and transaction completed', user });
    } else {
      // Do not extend the limit, transaction remains declined
      res.status(200).json({ message: 'Transaction declined', user });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error handling user response', error });
  }
};