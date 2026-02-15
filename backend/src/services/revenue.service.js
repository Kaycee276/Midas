const revenueModel = require('../models/revenue.model');
const merchantModel = require('../models/merchant.model');
const { ValidationError, NotFoundError } = require('../utils/errors');
const { ACCOUNT_STATUS } = require('../types/enums');

class RevenueService {
	async submitReport(merchantId, data) {
		const merchant = await merchantModel.findById(merchantId);
		if (!merchant) {
			throw new NotFoundError('Merchant not found');
		}
		if (merchant.account_status !== ACCOUNT_STATUS.ACTIVE) {
			throw new ValidationError('Only active merchants can submit revenue reports');
		}

		const netProfit = Number(data.gross_revenue) - Number(data.expenses);
		if (netProfit < 0) {
			throw new ValidationError('Net profit cannot be negative (expenses exceed revenue)');
		}

		const report = await revenueModel.create({
			merchant_id: merchantId,
			period_start: data.period_start,
			period_end: data.period_end,
			gross_revenue: data.gross_revenue,
			expenses: data.expenses,
			net_profit: netProfit,
			notes: data.notes || null,
			status: 'pending',
			submitted_at: new Date().toISOString()
		});

		return report;
	}

	async getReportHistory(merchantId, page = 1, limit = 20) {
		const offset = (page - 1) * limit;
		const { data, count } = await revenueModel.findByMerchantId(merchantId, limit, offset);

		return {
			reports: data,
			pagination: {
				total: count,
				page,
				limit,
				total_pages: Math.ceil(count / limit)
			}
		};
	}

	async getRevenueSummary(merchantId) {
		return await revenueModel.getRevenueSummary(merchantId);
	}
}

module.exports = new RevenueService();
