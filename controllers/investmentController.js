const Investment = require("../models/investment"); 


// Get all investments by User ID
const getInvestmentsByUserId = async (req, res) => {
    const user_id = parseInt(req.params.user_id);
        
    try{
        // Fetch investments for the given account_id
        const investments = await Investment.getInvestmentsByAccountId(user_id);

        if (!investments) {
            return res.status(404).send("No investments found for this account.");
        }

        // Return the investments data as JSON
        res.status(200).json(investments);
    } catch (error) {
        console.error("Error fetching investments:", error);
        res.status(500).send("An error occurred while retrieving investments.");
    }
};

const getInvestmentGrowthByUserId = async (req, res) => {
    const user_id = parseInt(req.params.user_id);

    try {
        const growthData = await Investment.getInvestmentGrowthByAccountId(user_id);

        if (!growthData) {
            return res.status(404).send("No investment data found for this account.");
        }

        // Return the growth data as JSON
        res.status(200).json(growthData);
    } catch (error) {
        console.error("Error fetching investment growth data:", error);
        res.status(500).send("An error occurred while retrieving investment data.");
    }
}

module.exports = {
    getInvestmentsByUserId,
    getInvestmentGrowthByUserId
};
