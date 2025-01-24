const Transaction = require('../models/transactions');
const nodemailer = require("nodemailer");
const { getUserByPhoneorNric } = require('./userController');

async function sendEmail(toEmail, subject, message) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "fsdp140606@gmail.com",
                pass: "rkwl oaui pozg hllr", // Use your App Password
            },
        });

        const mailOptions = {
            from: '"Bank Name" <fsdp140606@gmail.com>',
            to: toEmail,
            subject: subject,
            text: message,
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.response);

        // Optional: Return success information
        return { success: true, response: info.response };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error: error.message };
    }
}


const getTransactionsbyaccountid = async (req, res) => {
    try {
        const account_id = req.params.account_id;
        
        // Ensure account_id is a number (basic validation)
        if (isNaN(account_id)) {
            return res.status(400).json({ message: 'Invalid account ID format' });
        }
        
        const transactions = await Transaction.getTransactionsByAccountId(account_id);

        if (transactions && transactions.length > 0) {
            res.status(200).json(transactions);
        } else {
            res.status(404).json({ message: 'No transactions found' });
        }
    } catch (error) {
        console.error("Error retrieving transactions:", error);
        res.status(500).json({ message: 'Server error while retrieving transactions' });
    }
};

const deleteTransactionByTransactionId = async (req, res) => {
    const transaction_id = parseInt(req.params.transaction_id); // Get transactionId from parameters
    
    try {
      // Call the static method from the Transaction model to delete the transaction
      const success = await Transaction.deleteTransactionByTransactionId(transaction_id);
      
      if (!success) {
        return res.status(404).send("Transaction not found"); // Transaction not found
      }
      
      res.status(204).send(); // Success: No Content, the transaction has been deleted
    } catch (error) {
      console.error(error);
      res.status(500).send("Error deleting transaction"); // Internal Server Error
    }
};

const createTransaction = async (req, res) => {
    console.log("Request body received:", req.body);

    if (!req.body || typeof req.body !== "object") {
        return res.status(400).json({ message: "Request body is missing or invalid." });
    }

    const { account_id, phoneNumber, nric, amount, description } = req.body;

    if (!account_id || !amount || !description || (!phoneNumber && !nric)) {
        return res.status(400).json({
            message: "Missing required fields: account_id, amount, description, and either phoneNumber or nric.",
        });
    }

    try {
        console.log("Transaction details before creation:", { account_id, amount, description, phoneNumber, nric });

        // Automatically set the status based on the amount
        const status = amount >= 500 ? "pending" : "completed";

        const transactionCreated = await Transaction.createTransaction(
            account_id,
            amount,
            description,
            status,
            phoneNumber,
            nric
        );

        if (!transactionCreated) {
            return res.status(400).json({ message: "Failed to create transaction." });
        }

        console.log("Transaction created:", transactionCreated);

        // Respond with success immediately
        res.status(201).json({ message: "Transaction created successfully.", transaction: transactionCreated });

        // Trigger email sending in a separate process if the transaction amount is large
        if (amount >= 500) {
            console.log("Sending large transaction email...");
            console.log("Transaction details:", { account_id, amount, description, phoneNumber, nric });
            sendLargeTransactionEmail({ nric, phoneNumber, amount, description, status }).catch((error) => {
                console.warn("Failed to send email:", error.message);
            });
        }
    } catch (error) {
        console.error("Error creating transaction:", error.message || error);
        return res.status(500).json({ message: "Server error while creating transaction." });
    }
};

async function sendLargeTransactionEmail({ nric, phoneNumber, amount, description }) {
    try {
        // Pass nric and phoneNumber as an object
        const user = await getUserByPhoneorNric({ nric, phoneNumber });
        console.log("Retrieved user:", user); // Debug user data

        if (user && user.email) {
            const subject = "Large Transaction Alert";
            const message = `Dear ${user.name},\n\nA transaction of ${amount.toFixed(2)} was made from your account.\n\nDescription: ${description}\n\nYour transaction has been set to pending for safety purposes , please contact our support team to continue transacting.`;

            const emailResult = await sendEmail(user.email, subject, message);
            if (!emailResult.success) {
                console.warn("Failed to send email:", emailResult.error);
            } else {
                console.log("Large transaction email sent successfully.");
            }
        } else {
            console.warn("User not found or email missing for large transaction alert.");
        }
    } catch (error) {
        console.error("Error in sendLargeTransactionEmail:", error.message);
        throw error;
    }
}

// Controller to handle getting spending over time for a specific user
const getSpendingOverTime = async (req, res) => {
    const userId = req.params.user_id; // Get the user ID from the URL parameter
  
    if (!userId) {
      return res.status(400).send('User ID is required');
    }
  
    try {
      // Call the static method directly on the class
      const spendingData = await Transaction.getSpendingOverTime(userId);
      res.json(spendingData); // Send the data as JSON
    } catch (err) {
      console.error('Error in controller:', err);
      res.status(500).send('Internal Server Error');
    }
  };






module.exports = {
    getTransactionsbyaccountid,
    createTransaction,
    deleteTransactionByTransactionId,
    getSpendingOverTime
};
