const Account = require("../models/account");

// Get all the bank accounts associated with the specific user id. (GET)
const getAccountsById = async (req, res) => {
    const user_id = parseInt(req.params.user_id); // Get user id from parameters
  
    try {  
        // Fetch bank accounts for the given patient ID
        const accounts = await Account.getAccountsById(user_id);
        if (!accounts) {
            return res.status(404).send("Bank Accounts not found"); // Send a status code 404 Not Found if no bank accounts are found
        }
  
        res.json(accounts); // Send the retrieved bank accounts
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving bank accounts"); // Send a status code 500 Internal Server Error if fails to retrieve bank accounts
    }
};

// Get specific bank account associated with the specific account id. (GET)
const getAccountByAccountId = async (req, res) => {
    const account_id = parseInt(req.params.account_id); // Get account id from parameters

    try {
        const account = await Account.getAccountByAccountId(account_id); 
        if (!account) {
            return res.status(404).send("Bank Account not found"); // Send a status code 404 Not Found if no bank account are found
        }

        // Fetch transactions for the account
        const transactions = await Account.getTransactionsByAccountId(account_id);
        
        // Return both account and transactions together
        res.json({
            account,
            transactions 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving bank account details"); // Send a status code 500 Internal Server Error if fails to retrieve bank account
    }
};

module.exports = {
    getAccountsById,
    getAccountByAccountId
};