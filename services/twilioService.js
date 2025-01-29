const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql'); // Import mssql
const Twilio = require('twilio');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Twilio setup
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phone = process.env.TWILIO_PHONE_NUMBER;
const client = new Twilio(accountSid, authToken);

// MSSQL Database configuration
const config = {
    user: process.env.DB_USER,      // Replace with your DB username
    password: process.env.DB_PASS,  // Replace with your DB password
    server: process.env.DB_SERVER,  // Replace with your DB server
    database: process.env.DB_NAME,  // Replace with your DB name
    options: {
        encrypt: true,
        trustServerCertificate: true // For self-signed certificates
    }
};

// Endpoint to get the phone number
app.post('/get-phone-number', async (req, res) => {
    const { nric } = req.body;

    try {
        // Connect to the database
        const pool = await sql.connect(config);

        // Execute the query
        const result = await pool.request()
            .input('nric', sql.VarChar, nric) // Use parameterized query
            .query('SELECT phoneNumber FROM Users WHERE nric = @nric');

        // Check if a result was returned
        if (result.recordset.length > 0) {
            const phoneNumber = result.recordset[0].phoneNumber;
            res.json({ phoneNumber });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Database Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        sql.close(); // Close the database connection
    }
});

// Endpoint to send a message via Twilio
app.post('/send-twilio-message', (req, res) => {
    const { phoneNumber, message } = req.body;

    client.messages
        .create({
            body: message,
            from: phone, // Your Twilio phone number
            to: phoneNumber
        })
        .then((message) => {
            console.log('Message sent:', message.sid);
            res.json({ success: true, sid: message.sid });
        })
        .catch((error) => {
            console.error('Twilio Error:', error);
            res.status(500).json({ error: 'Failed to send message' });
        });
});