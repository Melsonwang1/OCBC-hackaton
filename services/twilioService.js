const sql = require('mssql');
const Twilio = require('twilio');
require('dotenv').config();
const config = require("../dbConfig");

// Twilio setup
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phone = process.env.TWILIO_PHONE_NUMBER;
const client = new Twilio(accountSid, authToken);

// Function to get phone number by NRIC
async function getPhoneNumber(nric) {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('nric', sql.VarChar, nric)
            .query('SELECT phoneNumber FROM Users WHERE nric = @nric');

        if (result.recordset.length > 0) {
            console.log("Phone Number Retrieved:", result.recordset[0].phoneNumber);
            return result.recordset[0].phoneNumber;
        } else {
            console.error("User not found for NRIC:", nric);
            return null;
        }
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error("Database error");
    }
}

// Function to send SMS via Twilio
async function sendBillReminder(phoneNumber) {
    try {
        const message = await client.messages.create({
            body: "Dear Customer, \n\nYou have payments due. Kindly log in to your OCBC Bank account to review the outstanding amount. \n\nIf the bills have already been settled, please disregard this message. \n\nThank you.",
            from: phone, 
            to: "+65" + phoneNumber
        });

        console.log('Message Sent:', message.sid);
        return { success: true, sid: message.sid };
    } catch (error) {
        console.error('Twilio Error:', error);
        return { success: false, error: error.message };
    }
}

module.exports = { getPhoneNumber, sendBillReminder };
