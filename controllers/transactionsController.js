const Transaction = require('../models/transactions');

const getTransactionsbyaccountid = async (req, res) => {
    try {
        const account_id = req.params.account_id;
        
        // Ensure account_id is a number (basic validation)
        if (isNaN(account_id)) {
            return res.status(400).json({ message: 'Invalid account ID format' });
        }
        
        const transactions = await Transactions.getTransactionsbyaccountid(account_id);

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

// Create a new transaction (POST)
const createTransaction = async (req, res) => {
    try {
        const { mobile_number, nric, amount, status, description } = req.body;

        // Ensure required fields are provided
        if (!mobile_number && !nric) {
            return res.status(400).json({ message: 'Mobile number or NRIC is required to find the account' });
        }

        // Attempt to create the transaction using the model method
        const transactionResponse = await Transaction.createTransaction(mobile_number, nric, amount, status, description);

        if (transactionResponse) {
            res.status(201).json({ message: 'Transaction created successfully' });
        } else {
            res.status(500).json({ message: 'Transaction creation failed' });
        }
    } catch (error) {
        console.error("Error creating transaction:", error);

        if (error.message === "Account not found for the provided mobile number or NRIC") {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Server error while creating transaction' });
        }
    }
};

module.exports = {
    getTransactionsbyaccountid,
    createTransaction
};
