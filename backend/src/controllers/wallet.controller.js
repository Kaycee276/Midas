const walletService = require('../services/wallet.service');
const { successResponse } = require('../utils/responseFormatter');

class WalletController {
	async getWalletInfo(req, res, next) {
		try {
			const walletInfo = await walletService.getWalletInfo(req.user.id);
			successResponse(res, walletInfo, 'Wallet info retrieved successfully');
		} catch (error) {
			next(error);
		}
	}

	async fundWallet(req, res, next) {
		try {
			const transaction = await walletService.fundWallet(
				req.user.id,
				req.validatedData.amount
			);
			successResponse(res, { transaction }, 'Wallet funded successfully', 201);
		} catch (error) {
			next(error);
		}
	}

	async withdrawFunds(req, res, next) {
		try {
			const transaction = await walletService.withdrawFunds(
				req.user.id,
				req.validatedData.amount
			);
			successResponse(res, { transaction }, 'Withdrawal successful');
		} catch (error) {
			next(error);
		}
	}

	async getTransactionHistory(req, res, next) {
		try {
			const page = parseInt(req.query.page) || 1;
			const limit = parseInt(req.query.limit) || 20;
			const result = await walletService.getTransactionHistory(req.user.id, page, limit);
			successResponse(res, result, 'Transaction history retrieved successfully');
		} catch (error) {
			next(error);
		}
	}
}

module.exports = new WalletController();
