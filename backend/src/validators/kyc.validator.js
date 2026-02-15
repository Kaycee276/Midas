const Joi = require('joi');

const kycSubmissionSchema = Joi.object({
  student_id_number: Joi.string().max(100).optional(),
  national_id_number: Joi.string().max(100).when('student_id_number', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required()
  }).messages({
    'any.required': 'National ID number is required if student ID is not provided'
  }),
  business_registration_number: Joi.string().max(100).optional(),
  tax_identification_number: Joi.string().max(100).optional(),
  years_in_operation: Joi.number().integer().min(0).max(100).optional(),
  average_monthly_revenue: Joi.number().min(0).max(9999999999.99).optional()
});

module.exports = {
  kycSubmissionSchema
};
