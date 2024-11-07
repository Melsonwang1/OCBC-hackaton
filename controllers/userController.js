const Users = require("../models/user");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// Example User Registration Controller
const registerUser = async (req, res) => {
    const { name, email, password, phoneNumber, nric, dob, recovery } = req.body;

    try {
        // Hash the password before storing it in the database
        const hashedPassword = await bcrypt.hash(password, 10); // saltRounds = 10

        // Create the user in the database (user_id is auto-generated)
        const newUser = await Users.createUser(name, email, hashedPassword, phoneNumber, nric, dob, recovery);

        res.status(201).send({ message: 'User registered successfully' });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).send("Error registering user");
    }
};

  

const loginUser = async (req, res) => {
    const { user_id, password } = req.body;
    
    try {
        const user = await Users.getUserById(user_id);

        if (!user) {
            return res.status(404).send("User not found");
        }

        const passwordMatches = await bcrypt.compare(password, user.password);

        if (!passwordMatches) {
            return res.status(401).send("Incorrect password");
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).send("JWT secret is not defined");
        }

        const accessToken = jwt.sign(
            { user_id: user.user_id, name: user.name, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: "Login successful",
            accessToken,
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Error logging in user");
    }
};


// Get specific user associated with the specific user id. (GET)
const getUserById = async (req, res) => {
    const user_id = parseInt(req.params.user_id); // Get user id from parameters

    try {
        const user = await Users.getUserById(user_id); 
        if (!user) {
            return res.status(404).send("User not found"); // Send a status code 404 Not Found if no user is found
        }
        
        // Return user data
        res.json({
            account: user,
        });
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
    registerUser
};
