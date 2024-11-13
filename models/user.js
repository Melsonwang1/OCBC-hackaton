const sql = require("mssql");
const dbConfig = require("../dbConfig");
const bcrypt = require('bcrypt');

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

    // Login the user with the nric and password
    static async loginUser(nric, password) {
        const connection = await sql.connect(dbConfig);
        const query = `SELECT * FROM Users WHERE nric = @nric`;
        const request = connection.request();
        request.input("nric", nric);
        const result = await request.query(query);

        connection.close();
        if (result.recordset.length === 0) {
            return null; // User not found
        }

        //If user is found, check if user email is the same as passed in email and check if the user hashedpassword match the passed in password
        if(nric === result.recordset[0].nric && await bcrypt.compare(password, result.recordset[0].password)){
            return result.recordset[0]
            ? new Users(
                result.recordset[0].user_id,
                result.recordset[0].name,
                result.recordset[0].email,
                result.recordset[0].phoneNumber,
                result.recordset[0].nric,
                result.recordset[0].dob,
            )
            : null;
        }
        else{
            return false; //return false if password is not correct
        }
    }

    //Create new User, which is signup with the userData
    static async createUser(userData){
        const hashedPassword = await bcrypt.hash(userData.password, 10); //hash the password with brcrypt hash, salt iteration 10 times
        const connection = await sql.connect(dbConfig);

        const checkValue = `SELECT nric, phoneNumber FROM Users WHERE nric = @nric OR phoneNumber = @phoneNumber`;
        const checkRequest = connection.request();
        checkRequest.input("nric",userData.nric);
        checkRequest.input("phoneNumber",userData.phoneNumber);
        const checkResult = await checkRequest.query(checkValue);
        //Check if recordset length is more than 0
        if(checkResult.recordset.length > 0){
            connection.close();
            //Check if nric already exist
            if(checkResult.recordset[0].nric === userData.nric){
                return 0;
            }
            //Check if phone number already exist
            else if(checkResult.recordset[0].phoneNumber === userData.phoneNumber){
                return 1;
            }
        }

        //Insert a new column with the userData to Users table
        const query = `INSERT INTO Users (name, email, password, phoneNumber, nric, dob) VALUES (@name, @email, @password, @phoneNumber, @nric, @dob); SELECT SCOPE_IDENTITY() AS user_id;`;

        const request = connection.request();
        request.input("name", userData.name);
        request.input("email", userData.email);
        request.input("password", hashedPassword);
        request.input("phoneNumber",userData.phoneNumber);
        request.input("nric", userData.nric);
        request.input("dob", userData.dob);

        const result = await request.query(query);

        connection.close();

        return result.recordset[0]; //return the user created
    }
    
    // Method to find user by ID
    static async getUserById(user_id) {
        const connection = await sql.connect(dbConfig);
        const query = `SELECT * FROM Users WHERE user_id = @user_id`; 
        const request = connection.request();
        request.input("user_id",user_id);
        const result = await request.query(query);

        await connection.close();

        //return the new User if user is found, else null
        return result.recordset[0]
        ? new Users(
            result.recordset[0].user_id,
            result.recordset[0].name,
            result.recordset[0].email,
            result.recordset[0].phoneNumber,
            result.recordset[0].nric,
            result.recordset[0].dob
        )
        : null;
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

    // Users Model: getUserByNric
    static async getUserByNric(nric) {
        const connection = await sql.connect(dbConfig);
        const query = `SELECT user_id, name, email, phoneNumber, nric, dob FROM Users WHERE nric = @nric`;
        const request = connection.request();
        request.input("nric", nric);
        const result = await request.query(query);

        await connection.close();

        if (result.recordset[0]) {
            return {
                user_id: result.recordset[0].user_id,
                name: result.recordset[0].name,
                email: result.recordset[0].email,
                phoneNumber: result.recordset[0].phoneNumber,
                nric: result.recordset[0].nric,
                dob: result.recordset[0].dob,
            };
        }
        return null;
    }

    // Users Model: getUserByPhoneNumber
    static async getUserByPhoneNumber(phoneNumber) {
        const connection = await sql.connect(dbConfig);
        const query = `SELECT user_id, name, email, phoneNumber, nric, dob FROM Users WHERE phoneNumber = @phoneNumber`;
        const request = connection.request();
        request.input("phoneNumber", phoneNumber);
        const result = await request.query(query);

        await connection.close();

        if (result.recordset[0]) {
            return {
                user_id: result.recordset[0].user_id,
                name: result.recordset[0].name,
                email: result.recordset[0].email,
                phoneNumber: result.recordset[0].phoneNumber,
                nric: result.recordset[0].nric,
                dob: result.recordset[0].dob,
            };
        }
        return null;
    }

}    

module.exports = Users;