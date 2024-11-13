const Joi = require('joi');

const validateTransaction = (req, res, next) => {
    const schema = Joi.object({
        account_id: Joi.number().integer().positive().required()
            .messages({
                "number.base": "Account ID must be a number",
                "number.integer": "Account ID must be an integer",
                "number.positive": "Account ID must be a positive number",
                "any.required": "Account ID is required"
            }),
        amount: Joi.number().positive().precision(2).required()
            .messages({
                "number.base": "Amount must be a number",
                "number.positive": "Amount must be a positive number",
                "number.precision": "Amount can only have up to two decimal places",
                "any.required": "Amount is required"
            }),
        description: Joi.string().max(255).required()
            .messages({
                "string.base": "Description must be a string",
                "string.max": "Description can have a maximum of 255 characters",
                "any.required": "Description is required"
            }),
        status: Joi.string().valid("completed", "pending").required()
            .messages({
                "string.base": "Status must be a string",
                "any.only": "Status must be either 'completed' or 'pending'",
                "any.required": "Status is required"
            }),
        phoneNumber: Joi.string().allow(null).optional()
            .messages({
                "string.base": "Phone number must be a string or null"
            }),
        nric: Joi.string().allow(null).optional()
            .messages({
                "string.base": "NRIC must be a string or null"
            })
    })
    .custom((value, helpers) => {
        // Ensure either phoneNumber or nric is provided, but not both
        if ((value.phoneNumber === null && value.nric === null) || (value.phoneNumber && value.nric)) {
            return helpers.message("Please provide either phoneNumber or nric, with one explicitly set to null.");
        }
        return value;
    });

    const { error } = schema.validate(req.body);

    if (error) {
        const errors = error.details.map((err) => err.message);
        return res.status(400).json({ message: "Validation error", errors });
    }

    next();
};

module.exports = validateTransaction;
