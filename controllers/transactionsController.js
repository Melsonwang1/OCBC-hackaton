const Transaction = require('../models/transactions');

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

const createTransaction = async (req, res) => {
    const { user_id, phoneNumber, nric, amount, description, status } = req.body;

    if (!user_id || !amount || !description || !status || (phoneNumber === null && nric === null) || (phoneNumber !== null && nric !== null)) {
        return res.status(400).json({
            message: 'Please provide user_id, amount, description, status, and either phoneNumber or nric, with one explicitly set to null.'
        });
    }

    try {
        const transactionCreated = await Transaction.createTransaction(
            user_id,
            amount,
            description,
            status,
            phoneNumber,
            nric
        );

        if (transactionCreated) {
            res.status(201).json({ message: 'Transaction created successfully' });
        } else {
            res.status(400).json({ message: 'Failed to create transaction' });
        }
    } catch (error) {
        console.error("Error creating transaction:", error);
        res.status(500).json({ message: 'Server error while creating transaction' });
    }
};


module.exports = createTransaction;







module.exports = {
    getTransactionsbyaccountid,
    createTransaction
};
