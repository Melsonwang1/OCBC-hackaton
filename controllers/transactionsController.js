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
    const { account_id, phoneNumber, nric, amount, description, status } = req.body;

    // Validate required fields and conditions
    if (!account_id || !amount || !description || !status || (phoneNumber === null && nric === null) || (phoneNumber !== null && nric !== null)) {
        return res.status(400).json({
            message: 'Please provide account_id, amount, description, status, and either phoneNumber or nric, with one explicitly set to null.'
        });
    }

    try {
        // Attempt to create the transaction
        const transactionCreated = await Transaction.createTransaction(
            account_id,
            amount,
            description,
            status,
            phoneNumber,
            nric
        );

        // Respond based on success or failure of transaction creation
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


module.exports = {
    getTransactionsbyaccountid,
    createTransaction,
    deleteTransactionByTransactionId
};
