const Transactions = require('../models/transactions');

const getTransactionsbyaccountid = async (req, res) => {
    const account_id = req.params.account_id;
    const transactions = await Transactions.getTransactionsbyaccountid(account_id);
    if (transactions) {
        res.json(transactions);
    } else {
        res.json({ message: 'No transactions found' });
    }
}

const createTransaction = async (req, res) => {
    const { account_id, amount, status, description } = req.body;
    const result = await Transactions.createTransaction(account_id, amount, status, description);
    if (result) {
        res.json({ message: 'Transaction created successfully' });
    } else {
        res.json({ message: 'Transaction creation failed' });
    }
}

module.exports = {
    getTransactionsbyaccountid,
    createTransaction
}