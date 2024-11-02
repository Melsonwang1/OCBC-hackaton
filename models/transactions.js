const sql = require("mssql");
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

    // Method to create a new transaction for an account
    static async createTransaction(mobile_number, nric, amount, status, description) {
        let connection;

        try {
            connection = await sql.connect(dbConfig);
            
            // Fetch the account_id using the mobile number or NRIC
            const account_id = await Users.getAccountIdByPhoneOrNric(mobile_number, nric);
            
            if (!account_id) {
                throw new Error("Account not found for the provided mobile number or NRIC");
            }

            const sqlQuery = `
                INSERT INTO transactions (account_id, amount, status, description, created_at, updated_at)
                VALUES (@account_id, @amount, @status, @description, @created_at, @updated_at)
            `;
            const request = connection.request();
            request.input('account_id', sql.Int, account_id);
            request.input('amount', sql.Decimal(10, 2), amount);
            request.input('status', sql.VarChar, status);
            request.input('description', sql.VarChar, description);
            request.input('created_at', sql.DateTime, new Date());
            request.input('updated_at', sql.DateTime, new Date());

            await request.query(sqlQuery);

            return { message: "Transaction successfully created" };
        } catch (error) {
            console.error("Error creating transaction:", error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
}

module.exports = Transaction;
