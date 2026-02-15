const supabase = require('../config/supabase');

class MerchantWalletModel {
	async creditBalance(merchantId, amount) {
		const { data, error } = await supabase.rpc('credit_merchant_balance', {
			p_merchant_id: merchantId,
			p_amount: amount,
		});

		if (error) throw error;
		return data;
	}

	async deductBalance(merchantId, amount) {
		const { data, error } = await supabase.rpc('deduct_merchant_balance', {
			p_merchant_id: merchantId,
			p_amount: amount,
		});

		if (error) throw error;
		return data;
	}

	async createTransaction(txnData) {
		const { data, error } = await supabase
			.from('merchant_wallet_transactions')
			.insert([txnData])
			.select()
			.single();

		if (error) throw error;
		return data;
	}

	async getTransactionHistory(merchantId, limit = 20, offset = 0) {
		const { data, count, error } = await supabase
			.from('merchant_wallet_transactions')
			.select('*', { count: 'exact' })
			.eq('merchant_id', merchantId)
			.order('created_at', { ascending: false })
			.range(offset, offset + limit - 1);

		if (error) throw error;
		return { data, count };
	}
}

module.exports = new MerchantWalletModel();
