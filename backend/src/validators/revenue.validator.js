const Joi = require('joi');

const submitReportSchema = Joi.object({
	gross_revenue: Joi.number().min(0).required(),
	expenses: Joi.number().min(0).required(),
	period_start: Joi.date().iso().required(),
	period_end: Joi.date().iso().min(Joi.ref('period_start')).required(),
	notes: Joi.string().max(2000).optional().allow('', null)
});

module.exports = {
	submitReportSchema
};
