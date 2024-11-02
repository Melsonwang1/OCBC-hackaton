const sql = require("mssql");
const dbConfig = require("../dbConfig");

class Users {
    constructor(user_id, name, email, password, phoneNumber, nric, dob, recovery) {
        this.user_id = user_id;
        this.name = name; // Make sure to include the 'name' property
        this.email = email;
        this.password = password;
        this.phoneNumber = phoneNumber;
        this.nric = nric;
        this.dob = dob;
        this.recovery = recovery;
    }

    // Get specific user by user Id
    static async getUserById(user_id) {
        let connection;

        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `SELECT * FROM Users WHERE user_id = @user_id`;
            const request = connection.request();
            request.input('user_id', sql.Int, user_id); // Specify the type of user_id

            const result = await request.query(sqlQuery);

            return result.recordset.length > 0
                ? new Users(
                    result.recordset[0].user_id,
                    result.recordset[0].name, // Ensure 'name' is included in the constructor
                    result.recordset[0].email,
                    result.recordset[0].password,
                    result.recordset[0].phoneNumber,
                    result.recordset[0].nric,
                    result.recordset[0].dob,
                    result.recordset[0].recovery
                )
                : null; // Return null if user not found
        } catch (error) {
            console.error("Error fetching user:", error); // Log any errors
            throw error; // Optionally rethrow the error for further handling
        } finally {
            if (connection) {
                await connection.close(); // Ensure connection is closed in finally block
            }
        }
    }
}

module.exports = Users;
