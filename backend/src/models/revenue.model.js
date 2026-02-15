const supabase = require('../config/supabase');

class RevenueModel {
	async create(data) {
		const { data: report, error } = await supabase
			.from('revenue_reports')
			.insert([data])
			.select()
			.single();

		if (error) throw error;
		return report;
	}

	async findById(id) {
		const { data, error } = await supabase
			.from('revenue_reports')
			.select(`
				*,
				merchant:merchants(id, business_name, business_type)
			`)
			.eq('id', id)
			.single();

		if (error && error.code !== 'PGRST116') throw error;
		return data;
	}

	async findByMerchantId(merchantId, limit = 20, offset = 0) {
		const { data, count, error } = await supabase
			.from('revenue_reports')
			.select('*', { count: 'exact' })
			.eq('merchant_id', merchantId)
			.order('created_at', { ascending: false })
			.range(offset, offset + limit - 1);

		if (error) throw error;
		return { data, count };
	}

	async updateStatus(id, status, extras = {}) {
		const { data, error } = await supabase
			.from('revenue_reports')
			.update({
				status,
				...extras,
				updated_at: new Date().toISOString()
			})
			.eq('id', id)
			.select()
			.single();

		if (error) throw error;
		return data;
	}

	async findPendingReports(limit = 20, offset = 0) {
		const { data, count, error } = await supabase
			.from('revenue_reports')
			.select(`
				*,
				merchant:merchants(id, business_name, business_type)
			`, { count: 'exact' })
			.eq('status', 'pending')
			.order('submitted_at', { ascending: true })
			.range(offset, offset + limit - 1);

		if (error) throw error;
		return { data, count };
	}

	async findApprovedUndistributed() {
		const { data, error } = await supabase
			.from('revenue_reports')
			.select(`
				*,
				merchant:merchants(id, business_name, business_type)
			`)
			.eq('status', 'approved')
			.order('submitted_at', { ascending: true });

		if (error) throw error;
		return data;
	}

	async getRevenueSummary(merchantId) {
		const { data: reports, error } = await supabase
			.from('revenue_reports')
			.select('gross_revenue, net_profit, status')
			.eq('merchant_id', merchantId);

		if (error) throw error;

		const summary = (reports || []).reduce((acc, r) => {
			acc.total_revenue += Number(r.gross_revenue) || 0;
			if (r.status === 'distributed') {
				acc.total_distributed += Number(r.net_profit) || 0;
			}
			if (r.status === 'pending') {
				acc.pending_count += 1;
			}
			return acc;
		}, { total_revenue: 0, total_distributed: 0, pending_count: 0 });

		return summary;
	}
}

module.exports = new RevenueModel();
