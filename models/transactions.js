const sql = require('mssql');
const dbConfig = require("../dbConfig");

class Transaction {
    constructor(transaction_id, account_id, amount, status, description, created_at, updated_at) {
        this.transaction_id = transaction_id;
        this.account_id = account_id;
        this.amount = amount;
        this.status = status;
        this.description = description;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    static async getTransactionsbyaccountid(account_id) {
        try {
            const connection = await sql.connect(dbConfig);
            const sqlQuery = `SELECT * FROM transactions WHERE account_id = @account_id`;
            const request = connection.request();
            request.input('account_id', sql.Int, account_id);
            const result = await request.query(sqlQuery);

            return result.recordset.length > 0
                ? result.recordset.map(row => new Transaction(row.transaction_id, row.account_id, row.amount, row.status, row.description, row.created_at, row.updated_at))
                : null;
        } catch (error) {
            console.error("Database query error:", error);
            throw error;
        }
    }

    static async createTransaction(account_id, amount, status, description) {
        try {
            const connection = await sql.connect(dbConfig);
            const sqlQuery = `
                INSERT INTO transactions (account_id, amount, date_of_transaction, status, description, created_at, updated_at) 
                VALUES (@account_id, @amount, GETDATE(), @status, @description, GETDATE(), GETDATE())`;
            
            const request = connection.request();
            request.input('account_id', sql.Int, account_id);
            request.input('amount', sql.Decimal, amount);
            request.input('status', sql.VarChar, status);
            request.input('description', sql.VarChar, description);
            
            const result = await request.query(sqlQuery);
    
            return result.rowsAffected > 0;
        } catch (error) {
            console.error("Database insertion error:", error);
            throw error;
        }
    }
    
}

module.exports = Transaction;
