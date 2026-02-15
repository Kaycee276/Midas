const express = require('express');
const router = express.Router();
const revenueController = require('../controllers/revenue.controller');
const { validate } = require('../middleware/validation');
const { verifyToken, requireMerchant } = require('../middleware/auth');
const { submitReportSchema } = require('../validators/revenue.validator');

router.post(
	'/',
	verifyToken,
	requireMerchant,
	validate(submitReportSchema),
	revenueController.submitReport
);

router.get(
	'/',
	verifyToken,
	requireMerchant,
	revenueController.getReportHistory
);

router.get(
	'/summary',
	verifyToken,
	requireMerchant,
	revenueController.getRevenueSummary
);

module.exports = router;
