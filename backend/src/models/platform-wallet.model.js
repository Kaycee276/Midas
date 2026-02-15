const supabase = require('../config/supabase');

class PlatformWalletModel {
	async getBalance() {
		const { data, error } = await supabase
			.from('platform_wallet')
			.select('*')
			.limit(1)
			.single();

		if (error) throw error;
		return data;
	}

	async creditBalance(amount) {
		const { data, error } = await supabase.rpc('credit_platform_balance', {
			p_amount: amount,
		});

		if (error) throw error;
		return data;
	}

	async createTransaction(txnData) {
		const { data, error } = await supabase
			.from('platform_wallet_transactions')
			.insert([txnData])
			.select()
			.single();

		if (error) throw error;
		return data;
	}

	async getTransactionHistory(limit = 20, offset = 0) {
		const { data, count, error } = await supabase
			.from('platform_wallet_transactions')
			.select('*', { count: 'exact' })
			.order('created_at', { ascending: false })
			.range(offset, offset + limit - 1);

		if (error) throw error;
		return { data, count };
	}
}

module.exports = new PlatformWalletModel();
