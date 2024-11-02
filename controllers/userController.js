const Users = require("../models/user");

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
    getAccountByNricOrPhone
};
