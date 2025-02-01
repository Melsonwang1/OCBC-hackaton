/*  Example of data structure
const spendingData = {
    "January": {
        food: 4000,
        fashion: 2000,
        groceries: 1500,
        entertainment: 800,
        transport: 1200
    },
    "February": {
        food: 3500,
        fashion: 1800,
        groceries: 1400,
        entertainment: 600,
        transport: 1100
    },
    "March": {
        food: 4500,
        fashion: 2200,
        groceries: 1600,
        entertainment: 900,
        transport: 1300
    }
}; */

// Default limit for each category
const spendingLimits = {
    food: 5000,
    fashion: 5000,
    groceries: 5000,
    entertainment: 5000,
    transport: 5000
};

// Example transaction history
const transactionHistory = [
    { category: "food", amount: 400, date: "2025-01-15" },
    { category: "transport", amount: 200, date: "2025-01-16" },
    { category: "fashion", amount: 300, date: "2025-01-17" }
];

// Function to display transaction history
function displayTransactionHistory() {
    const historyDiv = document.getElementById("transaction-history");
    transactionHistory.forEach(transaction => {
        const transactionElement = document.createElement("div");
        transactionElement.innerHTML = `<p>${transaction.date}: $${transaction.amount} on ${transaction.category}</p>`;
        historyDiv.appendChild(transactionElement);
    });
}

displayTransactionHistory();


const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');

// Initialize the Express app
const app = express();

// Twilio credentials
const accountSid = 'your_account_sid';
const authToken = 'your_auth_token';
const twilioPhoneNumber = 'your_twilio_phone_number';

// Create a Twilio client
const client = twilio(accountSid, authToken);

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// API to send SMS when a user exceeds a limit
app.post('/send-sms', (req, res) => {
  const { userPhone, category, excessAmount } = req.body;

  client.messages.create({
    body: `You have exceeded your ${category} limit by $${excessAmount}. Do you want to extend the limit and make the transaction now?`,
    from: twilioPhoneNumber,
    to: userPhone
  }).then(message => {
    console.log('SMS sent:', message.sid);
    res.json({ message: 'SMS sent', sid: message.sid });
  }).catch(error => {
    console.error('Error sending SMS:', error);
    res.status(500).json({ error: 'Failed to send SMS' });
  });
});

// API to handle user response (YES or NO)
app.post('/handle-response', (req, res) => {
  const { userResponse, category, excessAmount } = req.body;

  if (userResponse.toLowerCase() === 'yes') {
    const newLimit = excessAmount + 100;  // Example of increasing the limit
    console.log(`User chose to extend the ${category} limit. New limit is: $${newLimit}`);
    res.json({ message: `Your ${category} limit has been extended to $${newLimit}` });
  } else {
    console.log('User declined to extend the limit');
    res.json({ message: `Transaction declined. Returning items.` });
  }
});

// API to save adjusted limits (Scenario 3)
app.post('/save-limit', (req, res) => {
  const { category, newLimit } = req.body;

  console.log(`New ${category} limit saved: $${newLimit}`);
  res.json({ message: `Your ${category} limit has been updated to $${newLimit}` });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
