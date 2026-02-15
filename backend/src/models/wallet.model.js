const supabase = require('../config/supabase');

class WalletModel {
	// Atomic balance operations via RPC
	async deductBalance(studentId, amount) {
		const { data, error } = await supabase.rpc('deduct_wallet_balance', {
			p_student_id: studentId,
			p_amount: amount,
		});

		if (error) throw error;
		return data; // new balance
	}

	async creditBalance(studentId, amount) {
		const { data, error } = await supabase.rpc('credit_wallet_balance', {
			p_student_id: studentId,
			p_amount: amount,
		});

		if (error) throw error;
		return data; // new balance
	}

	// Wallet transactions
	async createTransaction(txnData) {
		const { data, error } = await supabase
			.from('wallet_transactions')
			.insert([txnData])
			.select()
			.single();

		if (error) throw error;
		return data;
	}

	async updateTransaction(id, updates) {
		const { data, error } = await supabase
			.from('wallet_transactions')
			.update({ ...updates, updated_at: new Date().toISOString() })
			.eq('id', id)
			.select()
			.single();

		if (error) throw error;
		return data;
	}

	async getTransactionHistory(studentId, limit = 20, offset = 0) {
		const { data, count, error } = await supabase
			.from('wallet_transactions')
			.select('*', { count: 'exact' })
			.eq('student_id', studentId)
			.order('created_at', { ascending: false })
			.range(offset, offset + limit - 1);

		if (error) throw error;
		return { data, count };
	}
}

module.exports = new WalletModel();
