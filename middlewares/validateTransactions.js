const Joi = require('joi');

const validateTransaction = (req, res, next) => {
    const schema = Joi.object({
        account_id: Joi.number().required(),
        amount: Joi.number().required(),
        status: Joi.string().required(),
        description: Joi.string().required()
    });

    const validation = schema.validate(req.body);
    if (validation.error) {
        const errors = validation.error.details.map((error) => error.message);
        res.status(400).json({ message: "Validation error", errors });
        return;
      }

    next();
}

module.exports = validateTransaction;

