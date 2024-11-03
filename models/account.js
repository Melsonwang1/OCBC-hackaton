const sql = require("mssql");
const dbConfig = require("../dbConfig");


class Account{
    constructor(account_id, account_number, account_name, user_id, balance_have, balance_owe, user_name){
        this.account_id = account_id;
        this.account_number = account_number;
        this.account_name = account_name;
        this.user_id = user_id;
        this.balance_have = balance_have;
        this.balance_owe = balance_owe;
        this.user_name = user_name;
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

    static async getAccountnameandnumberByAccountId(user_id) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT account_name, account_number FROM Account WHERE user_id = @user_id`;
        const request = connection.request();
        request.input('user_id', user_id);
    
        const result = await request.query(sqlQuery);
        connection.close();
    
        // Return an array of account records or an empty array if none are found
        return result.recordset.length > 0 ? result.recordset : [];
    }
    

    // Get specific bank account by Account Id
    static async getAccountByAccountId(account_id) {
        const connection = await sql.connect(dbConfig);
        // Update the SQL query to use the parameterized account_id
        const sqlQuery = `
            SELECT 
                a.account_id,
                a.account_number,
                a.account_name,
                a.user_id,
                a.balance_have,
                a.balance_owe,
                u.name AS user_name
            FROM 
                Account a
            INNER JOIN 
                Users u ON a.user_id = u.user_id
            WHERE 
                a.account_id = @account_id;`; // Use the parameter for filtering
    
        const request = connection.request();
        request.input('account_id', account_id); // Pass the account_id as a parameter
    
        const result = await request.query(sqlQuery);
        connection.close();
    
        // Return a new Account instance, including user_name if found
        return result.recordset.length > 0
            ? new Account(
                result.recordset[0].account_id,
                result.recordset[0].account_number,
                result.recordset[0].account_name,
                result.recordset[0].user_id,
                result.recordset[0].balance_have,
                result.recordset[0].balance_owe,
                result.recordset[0].user_name // Include user_name in the Account instance
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