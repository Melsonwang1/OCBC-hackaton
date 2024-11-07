const sql = require("mssql");
const dbConfig = require("../dbConfig");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class Users {
    constructor(user_id, name, email, password, phoneNumber, nric, dob, recovery) {
        this.user_id = user_id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.phoneNumber = phoneNumber;
        this.nric = nric;
        this.dob = dob;
        this.recovery = recovery;
    }

    static async createUser(name, email, password, phoneNumber, nric, dob, recovery) {
        let connection;
        try {
          connection = await sql.connect(dbConfig);
          const sqlQuery = `
            INSERT INTO Users (name, email, password, phoneNumber, nric, dob, recovery)
            VALUES (@name, @email, @password, @phoneNumber, @nric, @dob, @recovery)
          `;
    
          const request = connection.request();
          request.input('name', sql.VarChar, name);
          request.input('email', sql.VarChar, email);
          request.input('password', sql.VarChar, password); // Store the hashed password
          request.input('phoneNumber', sql.VarChar, phoneNumber);
          request.input('nric', sql.VarChar, nric);
          request.input('dob', sql.Date, dob);
          request.input('recovery', sql.VarChar, recovery);
    
          await request.query(sqlQuery);
          return true;
        } catch (error) {
          console.error("Error creating user:", error);
          throw error;
        } finally {
          if (connection) await connection.close();
        }
      }

    // Method to login a user
    static async loginUser(user_id, password) {
        const connection = await sql.connect(dbConfig);
        const query = `SELECT * FROM Users WHERE user_id = @user_id`;
        const request = connection.request();
        request.input("user_id", sql.Int, user_id);
        const result = await request.query(query);

        connection.close();
        if (result.recordset.length === 0) {
            return null; // User not found
        }

        const user = result.recordset[0];

        // Compare the entered password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            // If password matches, generate a JWT token
            const token = jwt.sign(
                { user_id: user.user_id, name: user.name, email: user.email }, 
                process.env.JWT_SECRET_KEY, 
                { expiresIn: '1h' } // Set token expiration
            );

            // Return the user object without the password and the token
            return { user, token };
        } else {
            return false; // Password is incorrect
        }
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
                    result.recordset[0].phoneNumber,
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
    static async getAccountIdByPhoneOrNric(phoneNumber, nric) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
                SELECT a.account_id
                FROM users u
                JOIN account a ON u.user_id = a.user_id
                WHERE u.phoneNumber = @phoneNumber OR u.nric = @nric
            `;
            const request = connection.request();
            request.input('phoneNumber', sql.VarChar, phoneNumber);
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
