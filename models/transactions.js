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
        let connection;
        connection = await sql.connect(dbConfig);
        const sqlquary = `SELECT * FROM transactions WHERE account_id = @account_id`;
        const request = connection.request();
        request.input('account_id', account_id);
        const result = await request.query(sqlquary);
        return result.recordset >0 ? result.recordset.map(row => new Transaction(row.transaction_id, row.account_id, row.amount, row.status, row.description, row.created_at, row.updated_at))
        : null;
    }

    static async createTransaction(account_id, amount, status, description) {
        let connection;
        connection = await sql.connect(dbConfig);
        const sqlQuery = `
            INSERT INTO transactions (account_id, amount, status, description, created_at, updated_at) 
            VALUES (@account_id, @amount, @status, @description, GETDATE(), GETDATE())`;
        const request = connection.request();
        request.input('account_id', account_id);
        request.input('amount', amount);
        request.input('status', status);
        request.input('description', description);
        const result = await request.query(sqlQuery);
        return result.rowsAffected > 0 ? true : false;
    }
    
}