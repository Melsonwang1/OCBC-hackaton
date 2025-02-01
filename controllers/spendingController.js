const db = require('../models'); // Assuming you use Sequelize
const twilio = require('twilio');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables

// Twilio Configuration (Use your actual Twilio credentials)
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

/**
 * Save spending limit for a category
 */
exports.saveLimit = async (req, res) => {
    const { category, newLimit } = req.body;

    try {
        await db.SpendingLimit.upsert({ category, limit: newLimit });
        res.json({ message: `Spending limit for ${category} updated to $${newLimit}` });
    } catch (error) {
        console.error('Error saving limit:', error);
        res.status(500).json({ message: 'Failed to update spending limit' });
    }
};

/**
 * Send SMS notification when user exceeds spending limit
 */
exports.sendSMS = async (req, res) => {
    const { userPhone, category, excessAmount } = req.body;

    try {
        const message = await client.messages.create({
            body: `Alert! You exceeded your ${category} budget by $${excessAmount}. Reply YES to increase limit, NO to keep it.`,
            from: TWILIO_PHONE_NUMBER,
            to: userPhone
        });

        res.json({ message: 'SMS sent successfully', sid: message.sid });
    } catch (error) {
        console.error('Error sending SMS:', error);
        res.status(500).json({ message: 'Failed to send SMS' });
    }
};

/**
 * Handle user SMS response
 */
exports.handleResponse = async (req, res) => {
    const { userResponse, category, excessAmount } = req.body;

    if (userResponse.toUpperCase() === 'YES') {
        try {
            const limitRecord = await db.SpendingLimit.findOne({ where: { category } });
            if (limitRecord) {
                const newLimit = parseInt(limitRecord.limit) + parseInt(excessAmount);
                await db.SpendingLimit.update({ limit: newLimit }, { where: { category } });

                return res.json({ message: `Your ${category} limit has been increased by $${excessAmount}. New limit: $${newLimit}.` });
            }
        } catch (error) {
            console.error('Error updating limit:', error);
            return res.status(500).json({ message: 'Failed to update limit' });
        }
    }

    res.json({ message: `Limit for ${category} remains unchanged.` });
};
