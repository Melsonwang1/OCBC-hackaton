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

    static async getTransactionsByAccountId(account_id) {
        let connection;
        try {
            // Establish the database connection
            connection = await sql.connect(dbConfig);
            
            const sqlQuery = `
                SELECT date_of_transaction, description, amount AS transaction_amount, status 
                FROM Transactions 
                WHERE account_id = @account_id
            `;
    
            // Prepare and execute the SQL query
            const request = connection.request();
            request.input('account_id', sql.Int, account_id);
            
            const result = await request.query(sqlQuery);
    
            // Return the necessary data for each transaction
            return result.recordset.map(row => ({
                date: row.date_of_transaction,
                description: row.description,
                transactionAmount: row.transaction_amount,
                status: row.status
            }));
        } catch (error) {
            console.error("Database query error:", error);
            throw error;  // Re-throw error for higher-level handling
        } finally {
            // Ensure the connection is closed after the query
            if (connection) {
                await connection.close();
            }
        }
    }
    
    

    

    static async createTransaction(user_id, amount, description, status, phoneNumber = null, nric = null) {
        if (phoneNumber === null && nric === null) {
            throw new Error("Either phone number or NRIC must be provided.");
        }
        if (phoneNumber !== null && nric !== null) {
            throw new Error("Only one of phone number or NRIC can be provided, not both.");
        }
        if (!['completed', 'pending'].includes(status.toLowerCase())) {
            throw new Error("Status must be either 'completed' or 'pending'.");
        }
    
        try {
            const connection = await sql.connect(dbConfig);
    
            const sqlQuery = `
                DECLARE @source_account_id INT;
                DECLARE @destination_account_id INT;
                DECLARE @source_balance_have DECIMAL(10, 2);
                DECLARE @input_amount DECIMAL(10, 2) = @input_amount_param;
                DECLARE @input_status NVARCHAR(50) = @input_status_param;
    
                -- Get the source account ID for the provided user_id
                SELECT @source_account_id = account_id
                FROM Account
                WHERE user_id = @user_id;
    
                -- Identify destination account based on phoneNumber or NRIC
                SELECT @destination_account_id = a.account_id
                FROM Users u
                JOIN Account a ON u.user_id = a.user_id
                WHERE (@phoneNumber IS NOT NULL AND u.phoneNumber = @phoneNumber)
                   OR (@nric IS NOT NULL AND u.nric = @nric);
    
                IF @source_account_id IS NULL
                BEGIN
                    THROW 50000, 'Source account not found for the provided user_id.', 1;
                END
    
                IF @destination_account_id IS NULL
                BEGIN
                    THROW 50000, 'Destination account not found for the provided phone number or NRIC.', 1;
                END
    
                IF @input_status = 'completed'
                BEGIN
                    -- Check balance and perform deduction for completed status
                    SELECT @source_balance_have = balance_have FROM Account WHERE account_id = @source_account_id;
                    IF @source_balance_have < @input_amount
                    BEGIN
                        THROW 50000, 'Insufficient balance in the source account.', 1;
                    END
                    -- Deduct from source account
                    UPDATE Account
                    SET balance_have = balance_have - @input_amount
                    WHERE account_id = @source_account_id;
    
                    -- Add to destination account
                    UPDATE Account
                    SET balance_have = balance_have + @input_amount
                    WHERE account_id = @destination_account_id;
                END
    
                -- Insert transaction records
                INSERT INTO Transactions (account_id, amount, status, description, date_of_transaction, created_at, updated_at)
                VALUES (@source_account_id, CASE WHEN @input_status = 'completed' THEN -@input_amount ELSE @input_amount END, @input_status, @description, GETDATE(), GETDATE(), GETDATE());
    
                INSERT INTO Transactions (account_id, amount, status, description, date_of_transaction, created_at, updated_at)
                VALUES (@destination_account_id, CASE WHEN @input_status = 'completed' THEN @input_amount ELSE 0 END, @input_status, @description, GETDATE(), GETDATE(), GETDATE());
            `;
    
            const request = connection.request();
            request.input('user_id', sql.Int, user_id);
            request.input('phoneNumber', sql.VarChar, phoneNumber);
            request.input('nric', sql.VarChar, nric);
            request.input('input_amount_param', sql.Decimal(10, 2), amount);
            request.input('description', sql.VarChar, description);
            request.input('input_status_param', sql.VarChar, status);
    
            const result = await request.query(sqlQuery);
            return result.rowsAffected && result.rowsAffected.length > 0 && result.rowsAffected.some(row => row > 0);
        } catch (error) {
            console.error("Database query error:", error);
            throw error;
        }
    }
    
    
    
    
    
    
    
    
    
    
    
    
}

module.exports = Transaction;
