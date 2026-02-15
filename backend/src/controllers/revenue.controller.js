const revenueService = require('../services/revenue.service');
const { successResponse } = require('../utils/responseFormatter');

class RevenueController {
	async submitReport(req, res, next) {
		try {
			const report = await revenueService.submitReport(req.user.id, req.validatedData);
			successResponse(res, { report }, 'Revenue report submitted successfully', 201);
		} catch (error) {
			next(error);
		}
	}

	async getReportHistory(req, res, next) {
		try {
			const page = parseInt(req.query.page) || 1;
			const limit = parseInt(req.query.limit) || 20;
			const result = await revenueService.getReportHistory(req.user.id, page, limit);
			successResponse(res, result, 'Revenue reports retrieved');
		} catch (error) {
			next(error);
		}
	}

	async getRevenueSummary(req, res, next) {
		try {
			const summary = await revenueService.getRevenueSummary(req.user.id);
			successResponse(res, summary, 'Revenue summary retrieved');
		} catch (error) {
			next(error);
		}
	}
}

module.exports = new RevenueController();
