const sql = require("mssql");
const dbConfig = require("../dbConfig");

class Users {
    constructor(user_id, name, email, password, mobile_number, nric, dob, recovery) {
        this.user_id = user_id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.mobile_number = mobile_number;
        this.nric = nric;
        this.dob = dob;
        this.recovery = recovery;
    }

    // Method to find user by ID
    static async getUserById(user_id) {
        let connection;

        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `SELECT * FROM users WHERE user_id = @user_id`;
            const request = connection.request();
            request.input('user_id', sql.Int, user_id);

            const result = await request.query(sqlQuery);

            return result.recordset.length > 0
                ? new Users(
                    result.recordset[0].user_id,
                    result.recordset[0].name,
                    result.recordset[0].email,
                    result.recordset[0].password,
                    result.recordset[0].mobile_number,
                    result.recordset[0].nric,
                    result.recordset[0].dob,
                    result.recordset[0].recovery
                )
                : null;
        } catch (error) {
            console.error("Error fetching user:", error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
    static async getAccountIdByPhoneOrNric(mobile_number, nric) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
                SELECT a.account_id
                FROM users u
                JOIN account a ON u.user_id = a.user_id
                WHERE u.mobile_number = @mobile_number OR u.nric = @nric
            `;
            const request = connection.request();
            request.input('mobile_number', sql.VarChar, mobile_number);
            request.input('nric', sql.VarChar, nric);
    
            const result = await request.query(sqlQuery);
            return result.recordset.length > 0 ? result.recordset[0].account_id : null;
        } catch (error) {
            console.error("Error fetching account ID:", error);
            throw error;
        } finally {
            if (connection) await connection.close();
        }
    }
}    

module.exports = Users;
