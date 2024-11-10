const Users = require("../models/user");
const jwt = require('jsonwebtoken');
require('dotenv').config()


const loginUser = async (req, res) => {
    const { nric, password, rememberMe } = req.body;

    try {
        const user = await Users.loginUser(nric, password);

        if (user === null) {
            return res.status(404).send("User not found");
        }

        if (!user) {
            return res.status(401).send("Incorrect password!");
        }

        const payload = {
            user_id: user.user_id,
            name: user.name,
            email: user.email,
        };

        // Set token expiration: 7 days if "Remember Me" is checked, 1 hour if not
        const tokenExpiration = rememberMe ? "7d" : "1h";
        const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: tokenExpiration });

        return res.json({
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            nric: user.nric,
            dob: user.dob,
            token: jwtToken,
        });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).send("Error logging in user.");
    }
};



const createUser = async (req,res) => {
    const userData = req.body

    try{
        const user = await Users.createUser(userData);
        if(user === 0){
            return res.status(409).send("Nric is already in use");
        }
        else if (user === 1) {
            return res.status(409).send("Phone number is already in use");
        }

        //Create a payload with user data
        const payload = {
            user_id: user.user_id,
            name: user.name,
            email: user.email,
        };
        //create a jwtToken using the payload and expire in 3600seconds
        const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "3600s" });

        //return the json with user data and token
        return res.json({
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            nric: user.nric,
            dob: user.dob,
            token: jwtToken,
        });
    }
    catch(error){
        console.error(error);
        res.status(500).send("Error creating User");
    }
};

// Get specific user associated with the specific user id. (GET)
const getUserById = async (req, res) => {
    const user_id = req.userId; // Get user id from parameters

    try {
        const user = await Users.getUserById(user_id); 
        // Return user data
        res.json(user)
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving User"); // Send a status code 500 Internal Server Error if fails to retrieve user
    }
};

const getAccountByNricOrPhone = async (req, res) => {
    const { nric, mobile_number } = req.query;

    if (!nric && !mobile_number) {
        return res.status(400).json({ message: "Please provide either NRIC or mobile number." });
    }

    try {
        const accountId = await Users.getAccountIdByPhoneOrNric(mobile_number, nric);

        if (!accountId) {
            return res.status(404).json({ message: "Account not found for the provided details." });
        }

        res.json({ account_id: accountId });
    } catch (error) {
        console.error("Error retrieving account by NRIC or phone:", error);
        res.status(500).json({ message: "Error retrieving account." });
    }
};

// Controller for retrieving user by NRIC
const getUserByNric = async (req, res) => {
    const nric = req.query.nric;

    if (!nric) {
        return res.status(400).json({ message: "Please provide an NRIC." });
    }

    try {
        const user = await Users.getUserByNric(nric);
        if (user) {
            res.json(user);  // Sends user data back
        } else {
            res.status(404).json({ message: "User not found." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving User");
    }
};

// Controller for retrieving user by phone number
const getUserByPhoneNumber = async (req, res) => {
    const phoneNumber = req.query.phoneNumber;

    if (!phoneNumber) {
        return res.status(400).json({ message: "Please provide a phone number." });
    }

    try {
        const user = await Users.getUserByPhoneNumber(phoneNumber);
        if (user) {
            res.json(user);  // Sends user data back
        } else {
            res.status(404).json({ message: "User not found." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving User");
    }
};

// Controller to handle either NRIC or phone number
const getUserByPhoneorNric = async (req, res) => {
    const { nric, phoneNumber } = req.query;

    if (nric) {
        await getUserByNric(req, res);  // Calls the NRIC handler
    } else if (phoneNumber) {
        await getUserByPhoneNumber(req, res);  // Calls the phone number handler
    } else {
        res.status(400).json({ message: "Please provide either an NRIC or phone number." });
    }
};

module.exports = {
    getUserById,
    getAccountByNricOrPhone,
    loginUser,
    createUser,
    getUserByNric,
    getUserByPhoneNumber,
    getUserByPhoneorNric
};