const Joi = require('joi');

const studentRegistrationSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character'
    }),
  full_name: Joi.string().min(2).max(255).required(),
  student_id: Joi.string().max(100).optional(),
  phone: Joi.string().pattern(/^\+?[\d\s\-()]+$/).min(10).max(20).optional(),
  university: Joi.string().max(255).optional(),
  program: Joi.string().max(255).optional(),
  year_of_study: Joi.number().integer().min(1).max(10).optional(),
  terms_accepted: Joi.boolean().valid(true).required().messages({
    'any.only': 'You must accept the terms and conditions'
  })
});

const studentLoginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required()
});

const studentUpdateSchema = Joi.object({
  full_name: Joi.string().min(2).max(255).optional(),
  phone: Joi.string().pattern(/^\+?[\d\s\-()]+$/).min(10).max(20).optional(),
  university: Joi.string().max(255).optional(),
  program: Joi.string().max(255).optional(),
  year_of_study: Joi.number().integer().min(1).max(10).optional()
}).min(1);

module.exports = {
  studentRegistrationSchema,
  studentLoginSchema,
  studentUpdateSchema
};
