const Joi = require('joi');
const { KYC_STATUS } = require('../types/enums');

const adminLoginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required()
});

const kycReviewSchema = Joi.object({
  status: Joi.string()
    .valid(KYC_STATUS.APPROVED, KYC_STATUS.REJECTED, KYC_STATUS.RESUBMISSION_REQUIRED)
    .required(),
  rejection_reason: Joi.string().max(1000).when('status', {
    is: Joi.valid(KYC_STATUS.REJECTED, KYC_STATUS.RESUBMISSION_REQUIRED),
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  admin_notes: Joi.string().max(2000).optional()
});

module.exports = {
  adminLoginSchema,
  kycReviewSchema
};
