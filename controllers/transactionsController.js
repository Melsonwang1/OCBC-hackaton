const Transactions = require('../models/transactions');

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

const createTransaction = async (req, res) => {
    try {
        const { account_id, amount, status, description } = req.body;

        // Attempt to create the transaction
        const isTransactionCreated = await Transactions.createTransaction(account_id, amount, status, description);

        if (isTransactionCreated) {
            res.status(201).json({ message: 'Transaction created successfully' });
        } else {
            res.status(500).json({ message: 'Transaction creation failed' });
        }
    } catch (error) {
        console.error("Error creating transaction:", error);

        // Handle specific validation errors if they exist
        if (error.name === 'ValidationError') {
            res.status(400).json({ message: 'Validation error', details: error.details });
        } else {
            res.status(500).json({ message: 'Server error while creating transaction' });
        }
    }
};

module.exports = {
    getTransactionsbyaccountid,
    createTransaction
};
