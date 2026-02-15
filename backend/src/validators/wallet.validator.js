const Joi = require('joi');

const fundWalletSchema = Joi.object({
	amount: Joi.number().min(100).max(10000000).required().messages({
		'number.min': 'Minimum amount is \u20A6100',
		'number.max': 'Maximum amount is \u20A610,000,000',
	}),
});

const withdrawSchema = Joi.object({
	amount: Joi.number().min(100).max(10000000).required().messages({
		'number.min': 'Minimum withdrawal is \u20A6100',
		'number.max': 'Maximum withdrawal is \u20A610,000,000',
	}),
});

module.exports = {
	fundWalletSchema,
	withdrawSchema,
};
