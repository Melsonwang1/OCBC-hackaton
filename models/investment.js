const sql = require("mssql");
const dbConfig = require("../dbConfig");

class Investment {
    constructor(investment_id, account_id, amount, profit_loss, created_at, updated_at) {
        this.investment_id = investment_id;
        this.account_id = account_id;
        this.amount = amount;
        this.profit_loss = profit_loss;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    // Get all investments by Account ID
    static async getInvestmentsByAccountId(account_id) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `SELECT * FROM Investment WHERE account_id = @account_id`;
            const request = connection.request();
            request.input('account_id', sql.Int, account_id);

            const result = await request.query(sqlQuery);

            return result.recordset.map(
                (row) => new Investment(
                    row.investment_id,
                    row.account_id,
                    row.amount,
                    row.profit_loss,
                    row.created_at,
                    row.updated_at
                )
            );
        } catch(error) {
            console.error("Error fetching investments by account ID:", error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    static async getInvestmentGrowthByAccountId(account_id) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
                SELECT created_at, amount, profit_loss
                FROM Investment
                WHERE account_id = @account_id
                ORDER BY created_at ASC;
            `;
            const request = connection.request();
            request.input('account_id', sql.Int, account_id);

            const result = await request.query(sqlQuery);

            // Return the raw data for graph plotting
            return result.recordset;
        } catch(error) {
            console.error("Error fetching investment growth data by account ID:", error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
}

module.exports = Investment; // Export Investment Class
