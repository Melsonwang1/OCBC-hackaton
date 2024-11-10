const Users = require("../models/user");
const jwt = require('jsonwebtoken');
require('dotenv').config()


const loginUser = async (req, res) => {
    const { nric, password } = req.body;

    try {
        const user = await Users.loginUser(nric, password);

        // Handle user not found
        if(user === null){
            return res.status(404).send("User not found");
        }

        //If user is false, password is wrong
        if(!user){
            return res.status(401).send("Password Wrong!");
        }

        // If user is found and password is correct, create a payload with the user data
        const payload = {
            user_id: user.user_id,
            name: user.name,
            email: user.email
        };

        // Create a new JWT token with the payload and expiration time
        const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "3600s" });

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


module.exports = {
    getUserById,
    getAccountByNricOrPhone,
    loginUser,
    createUser
};
