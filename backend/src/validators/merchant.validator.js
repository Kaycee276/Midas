const Joi = require('joi');
const { BUSINESS_TYPES, PROXIMITY_OPTIONS } = require('../utils/constants');

const merchantRegistrationSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character'
    }),
  business_name: Joi.string().min(2).max(255).required(),
  business_type: Joi.string().valid(...BUSINESS_TYPES).required(),
  business_description: Joi.string().max(1000).optional(),
  business_address: Joi.string().min(10).max(500).required(),
  business_phone: Joi.string().pattern(/^\+?[\d\s\-()]+$/).min(10).max(20).required(),
  owner_full_name: Joi.string().min(2).max(255).required(),
  owner_phone: Joi.string().pattern(/^\+?[\d\s\-()]+$/).min(10).max(20).required(),
  owner_email: Joi.string().email().lowercase().optional(),
  proximity_to_campus: Joi.string().valid(...PROXIMITY_OPTIONS).required(),
  terms_accepted: Joi.boolean().valid(true).required().messages({
    'any.only': 'You must accept the terms and conditions'
  })
});

const merchantLoginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required()
});

const merchantUpdateSchema = Joi.object({
  business_name: Joi.string().min(2).max(255).optional(),
  business_type: Joi.string().valid(...BUSINESS_TYPES).optional(),
  business_description: Joi.string().max(1000).optional(),
  business_address: Joi.string().min(10).max(500).optional(),
  business_phone: Joi.string().pattern(/^\+?[\d\s\-()]+$/).min(10).max(20).optional(),
  owner_full_name: Joi.string().min(2).max(255).optional(),
  owner_phone: Joi.string().pattern(/^\+?[\d\s\-()]+$/).min(10).max(20).optional(),
  owner_email: Joi.string().email().lowercase().optional(),
  proximity_to_campus: Joi.string().valid(...PROXIMITY_OPTIONS).optional()
}).min(1);

module.exports = {
  merchantRegistrationSchema,
  merchantLoginSchema,
  merchantUpdateSchema
};
