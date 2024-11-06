const Investment = require("../models/investment"); 


// Get all investments by Account ID
const getInvestmentsByAccountId = async (req, res) => {
        const account_id = parseInt(req.params.account_id);
        
    try{
        // Fetch investments for the given account_id
        const investments = await Investment.getInvestmentsByAccountId(account_id);

        if (investments.length === 0) {
            return res.status(404).json({ message: "No investments found for this account." });
        }

        // Return the investments data as JSON
        res.status(200).json(investments);
    } catch (error) {
        console.error("Error fetching investments:", error);
        res.status(500).json({ message: "An error occurred while retrieving investments." });
    }
};

module.exports = {
    getInvestmentsByAccountId
};
