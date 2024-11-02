const sql = require("mssql");
const dbConfig = require("../dbConfig");

class Account{
    constructor(account_id, account_number, account_name, user_id, balance_have, balance_owe,){
        this.account_id = account_id;
        this.account_number = account_number;
        this.account_name = account_name;
        this.user_id = user_id;
        this.balance_have = balance_have;
        this.balance_owe = balance_owe;
    }

    // Get all the bank accounts by User Id
    static async getAccountsById(user_id){
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM  Account WHERE user_id = @user_id`;
        const request = connection.request();
        request.input('user_id', user_id);

        const result = await request.query(sqlQuery);
        connection.close();

        return result.recordset.map(
            (row) => new Account(row.account_id, row.account_number, row.account_name, row.user_id, row.balance_have, row.balance_owe)
        );
    }

    // Get specific bank account by Account Id
    static async getAccountByAccountId(account_id) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM Account WHERE account_id = @account_id`;
        const request = connection.request();
        request.input('account_id', account_id);
    
        const result = await request.query(sqlQuery);
        connection.close();
    
        return result.recordset.length > 0
            ? new Account(
                result.recordset[0].account_id,
                result.recordset[0].account_number,
                result.recordset[0].account_name,
                result.recordset[0].user_id,
                result.recordset[0].balance_have,
                result.recordset[0].balance_owe
            )
            : null; // Return null if account not found
    }

    // Get transactions for the specific bank account by Account Id (GET)
    static async getTransactionsByAccountId(account_id) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM Transactions WHERE account_id = @account_id`;
        const request = connection.request();
        request.input('account_id', account_id);

        const result = await request.query(sqlQuery);
        connection.close();

        return result.recordset; // Return all transactions associated with the account_id
    }
    
}

module.exports = Account; // Export Account Class