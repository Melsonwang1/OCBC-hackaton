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
    console.log("Request body:", req.body);

    // Validate if req.body exists
    if (!req.body || typeof req.body !== "object") {
        return res.status(400).json({ message: "Request body is missing or invalid." });
    }

    // Destructure and validate required fields
    const { account_id, phoneNumber, nric, amount, description, status } = req.body;

    if (!account_id || !amount || !description || !status || (!phoneNumber && !nric)) {
        return res.status(400).json({
            message: "Missing required fields: account_id, amount, description, status, and either phoneNumber or nric."
        });
    }

    try {
        // Create the transaction in the database
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

        // Fetch the user associated with the phone number or NRIC
        const user = await getUserByPhoneorNric({ nric, phoneNumber });
        if (user && user.email) {
            // Send an email for transactions exceeding a threshold
            if (amount > 1000) {
                const subject = "Large Transaction Alert";
                const message = `Dear ${user.name},\n\nA transaction of ${amount.toFixed(2)} was made from your account.\n\nDescription: ${description}\n\nIf this was not you, please contact our support team immediately.`;

                const emailResult = await sendEmail(user.email, subject, message);
                if (!emailResult.success) {
                    console.warn("Failed to send email:", emailResult.error);
                }
            }
        }

        return res.status(201).json({ message: "Transaction created successfully." });
    } catch (error) {
        console.error("Error creating transaction:", error.message || error);
        return res.status(500).json({ message: "Server error while creating transaction." });
    }
};


module.exports = {
    getTransactionsbyaccountid,
    createTransaction,
    deleteTransactionByTransactionId
};
