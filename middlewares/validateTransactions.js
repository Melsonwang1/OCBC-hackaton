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
        status: Joi.string().valid("completed", "pending", "failed").required()
            .messages({
                "string.base": "Status must be a string",
                "any.only": "Status must be one of 'completed', 'pending', or 'failed'",
                "any.required": "Status is required"
            }),
        description: Joi.string().max(255).required()
            .messages({
                "string.base": "Description must be a string",
                "string.max": "Description can have a maximum of 255 characters",
                "any.required": "Description is required"
            })
    });

    const validation = schema.validate(req.body);
    if (validation.error) {
        const errors = validation.error.details.map((error) => error.message);
        res.status(400).json({ message: "Validation error", errors });
        return;
    }

    next();
};

module.exports = validateTransaction;
