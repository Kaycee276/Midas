const crypto = require('crypto');
const merchantWalletModel = require('../models/merchant-wallet.model');
const merchantModel = require('../models/merchant.model');
const revenueModel = require('../models/revenue.model');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { MERCHANT_WALLET_TRANSACTION_TYPE, WALLET_TRANSACTION_STATUS } = require('../types/enums');

class MerchantWalletService {
	async getWalletInfo(merchantId) {
		const merchant = await merchantModel.findById(merchantId);
		if (!merchant) throw new NotFoundError('Merchant not found');

		const { data: transactions } = await merchantWalletModel.getTransactionHistory(merchantId, 10, 0);

		return {
			balance: parseFloat(merchant.wallet_balance) || 0,
			recent_transactions: transactions,
		};
	}

	async withdrawFunds(merchantId, amount) {
		const merchant = await merchantModel.findById(merchantId);
		if (!merchant) throw new NotFoundError('Merchant not found');

		const balance = parseFloat(merchant.wallet_balance) || 0;
		if (balance < amount) {
			throw new ValidationError('Insufficient wallet balance');
		}

		// Check if withdrawal would drop below amount reserved for pending distributions
		const reservedAmount = await revenueModel.getPendingDistributionTotal(merchantId);
		const availableBalance = balance - reservedAmount;
		if (amount > availableBalance) {
			throw new ValidationError(
				`₦${reservedAmount.toLocaleString()} is reserved for pending profit distributions. Available for withdrawal: ₦${availableBalance.toLocaleString()}`
			);
		}

		const reference = `mwdr_${crypto.randomUUID()}`;

		const newBalance = await merchantWalletModel.deductBalance(merchantId, amount);

		const transaction = await merchantWalletModel.createTransaction({
			merchant_id: merchantId,
			type: MERCHANT_WALLET_TRANSACTION_TYPE.WITHDRAWAL,
			amount,
			balance_before: balance,
			balance_after: newBalance,
			payment_reference: reference,
			status: WALLET_TRANSACTION_STATUS.COMPLETED,
			description: `Wallet withdrawal of \u20A6${amount.toLocaleString()}`,
		});

		return transaction;
	}

	async getTransactionHistory(merchantId, page = 1, limit = 20) {
		const offset = (page - 1) * limit;
		const { data, count } = await merchantWalletModel.getTransactionHistory(merchantId, limit, offset);

		return {
			transactions: data,
			pagination: {
				total: count,
				page,
				limit,
				total_pages: Math.ceil(count / limit),
			},
		};
	}
}

module.exports = new MerchantWalletService();
