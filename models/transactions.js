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
    
    

    

    static async createTransaction(account_id, amount, description, phoneNumber = null, nric = null) {
        // Ensure exactly one of phoneNumber or nric is provided as non-null
        if (phoneNumber === null && nric === null) {
            throw new Error("Either phone number or NRIC must be provided.");
        }
        if (phoneNumber !== null && nric !== null) {
            throw new Error("Only one of phone number or NRIC can be provided, not both.");
        }
    
        try {
            const connection = await sql.connect(dbConfig);
    
            const sqlQuery = `
                DECLARE @destination_account_id INT;
                DECLARE @source_balance_have DECIMAL(10,2);
                DECLARE @amount DECIMAL(10,2) = @input_amount;
        
                -- Identify the destination account based on phoneNumber or nric
                SELECT @destination_account_id = a.account_id
                FROM Users u
                JOIN Account a ON u.user_id = a.user_id
                WHERE (@phoneNumber IS NOT NULL AND u.phoneNumber = @phoneNumber)
                   OR (@nric IS NOT NULL AND u.nric = @nric);
        
                -- Check if the destination account was found
                IF @destination_account_id IS NULL
                BEGIN
                    THROW 50000, 'Destination account not found for the provided phone number or NRIC.', 1;
                END
        
                -- Get the source account balance
                SELECT @source_balance_have = balance_have FROM Account WHERE account_id = @account_id;
        
                -- Check if the source account has sufficient balance
                IF @source_balance_have < @amount
                BEGIN
                    THROW 50000, 'Insufficient balance in the source account.', 1;
                END
        
                -- Deduct amount from the source account and update balance
                UPDATE Account
                SET balance_have = balance_have - @amount
                WHERE account_id = @account_id;
        
                -- Add amount to the destination account and update balance
                UPDATE Account
                SET balance_have = balance_have + @amount
                WHERE account_id = @destination_account_id;
        
                -- Insert transaction record for the source account (debit)
                INSERT INTO Transactions (account_id, amount, status, description, date_of_transaction, created_at, updated_at)
                VALUES (@account_id, -@amount, 'completed', @description, GETDATE(), GETDATE(), GETDATE());
        
                -- Insert transaction record for the destination account (credit)
                INSERT INTO Transactions (account_id, amount, status, description, date_of_transaction, created_at, updated_at)
                VALUES (@destination_account_id, @amount, 'completed', @description, GETDATE(), GETDATE(), GETDATE());
            `;
    
            // Prepare SQL request and input parameters
            const request = connection.request();
            request.input('account_id', sql.Int, account_id);
            request.input('phoneNumber', sql.VarChar, phoneNumber);
            request.input('nric', sql.VarChar, nric);
            request.input('input_amount', sql.Decimal(10, 2), amount);
            request.input('description', sql.VarChar, description);
    
            // Execute the query
            const result = await request.query(sqlQuery);
    
            // Check if rows were affected (indicating success)
            return result.rowsAffected && result.rowsAffected.length > 0 && result.rowsAffected.some(row => row > 0);
        } catch (error) {
            console.error("Database query error:", error); // Log detailed SQL error
            throw error;
        }
    }
    
    
    
    
    
    
    
    
    
}

module.exports = Transaction;
