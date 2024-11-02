const Users = require("../models/user");

// Get specific user associated with the specific user id. (GET)
const getUserById = async (req, res) => {
    const user_id = parseInt(req.params.user_id); // Get user id from parameters

    try {
        const user = await Users.getUserById(user_id); 
        if (!user) {
            return res.status(404).send("User not found"); // Send a status code 404 Not Found if no user are found
        }
        
        // Return account with transactions
        res.json({
            account: user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving User"); // Send a status code 500 Internal Server Error if fails to retrieve user
    }
};

module.exports = {
    getUserById
};