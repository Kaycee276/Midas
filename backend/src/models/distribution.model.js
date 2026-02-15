const supabase = require('../config/supabase');

class DistributionModel {
	async create(data) {
		const { data: distribution, error } = await supabase
			.from('dividend_distributions')
			.insert([data])
			.select()
			.single();

		if (error) throw error;
		return distribution;
	}

	async createPayout(data) {
		const { data: payout, error } = await supabase
			.from('dividend_payouts')
			.insert([data])
			.select()
			.single();

		if (error) throw error;
		return payout;
	}

	async updateStatus(id, status, extras = {}) {
		const { data, error } = await supabase
			.from('dividend_distributions')
			.update({ status, ...extras })
			.eq('id', id)
			.select()
			.single();

		if (error) throw error;
		return data;
	}

	async findByRevenueReportId(reportId) {
		const { data, error } = await supabase
			.from('dividend_distributions')
			.select('*')
			.eq('revenue_report_id', reportId)
			.single();

		if (error && error.code !== 'PGRST116') throw error;
		return data;
	}

	async getRecentDistributions(limit = 10, offset = 0) {
		const { data, count, error } = await supabase
			.from('dividend_distributions')
			.select(`
				*,
				merchant:merchants(id, business_name, business_type)
			`, { count: 'exact' })
			.order('created_at', { ascending: false })
			.range(offset, offset + limit - 1);

		if (error) throw error;
		return { data, count };
	}
}

module.exports = new DistributionModel();
