const sql = require("mssql");
const dbConfig = require("../dbConfig");

class Investment {
    constructor(investment_id, user_id, amount, period_start, period_end, profit_loss) {
        this.investment_id = investment_id;
        this.user_id = user_id;
        this.amount = amount;
        this.period_start = period_start;
        this.period_end = period_end;
        this.profit_loss = profit_loss;
    }

    // Get all investments by Account ID
    static async getInvestmentsByAccountId(user_id) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `SELECT * FROM Investment WHERE user_id = @user_id`;
            const request = connection.request();
            request.input('user_id', sql.Int, user_id);

            const result = await request.query(sqlQuery);

            return result.recordset.map(
                (row) => new Investment(
                    row.investment_id,
                    row.user_id,
                    row.amount,
                    row.period_start,
                    row.period_end,
                    row.profit_loss,
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

    static async getInvestmentGrowthByAccountId(user_id) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
                SELECT amount, period_start, period_end, profit_loss
                FROM Investment
                WHERE user_id = @user_id
                ORDER BY period_start ASC;
            `;
            const request = connection.request();
            request.input('user_id', sql.Int, user_id);

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
