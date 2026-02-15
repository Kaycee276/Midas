const Joi = require('joi');

const createInvestmentSchema = Joi.object({
  merchant_id: Joi.string().uuid().required(),
  amount: Joi.number().min(10).max(1000000).required().messages({
    'number.min': 'Minimum investment amount is $10',
    'number.max': 'Maximum investment amount is $1,000,000'
  }),
  notes: Joi.string().max(500).optional()
});

const updateInvestmentSchema = Joi.object({
  current_value: Joi.number().min(0).optional(),
  return_amount: Joi.number().optional(),
  return_percentage: Joi.number().optional(),
  notes: Joi.string().max(500).optional()
}).min(1);

module.exports = {
  createInvestmentSchema,
  updateInvestmentSchema
};
