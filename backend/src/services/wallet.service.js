const crypto = require('crypto');
const walletModel = require('../models/wallet.model');
const studentModel = require('../models/student.model');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { WALLET_TRANSACTION_TYPE, WALLET_TRANSACTION_STATUS } = require('../types/enums');

class WalletService {
	async getWalletInfo(studentId) {
		const student = await studentModel.findById(studentId);
		if (!student) throw new NotFoundError('Student not found');

		const { data: transactions } = await walletModel.getTransactionHistory(studentId, 10, 0);

		return {
			balance: parseFloat(student.wallet_balance) || 0,
			recent_transactions: transactions,
		};
	}

	// --- Deposit (simulated — credits wallet immediately) ---

	async fundWallet(studentId, amount) {
		const student = await studentModel.findById(studentId);
		if (!student) throw new NotFoundError('Student not found');

		const reference = `dep_${crypto.randomUUID()}`;
		const balanceBefore = parseFloat(student.wallet_balance) || 0;

		// Credit wallet atomically
		const newBalance = await walletModel.creditBalance(studentId, amount);

		// Record completed transaction
		const transaction = await walletModel.createTransaction({
			student_id: studentId,
			type: WALLET_TRANSACTION_TYPE.DEPOSIT,
			amount,
			balance_before: balanceBefore,
			balance_after: newBalance,
			payment_reference: reference,
			status: WALLET_TRANSACTION_STATUS.COMPLETED,
			description: `Wallet deposit of \u20A6${amount.toLocaleString()}`,
		});

		return transaction;
	}

	// --- Withdrawal (simulated — deducts wallet immediately) ---

	async withdrawFunds(studentId, amount) {
		const student = await studentModel.findById(studentId);
		if (!student) throw new NotFoundError('Student not found');

		const balance = parseFloat(student.wallet_balance) || 0;
		if (balance < amount) {
			throw new ValidationError('Insufficient wallet balance');
		}

		const reference = `wdr_${crypto.randomUUID()}`;

		// Deduct balance atomically
		const newBalance = await walletModel.deductBalance(studentId, amount);

		// Record completed transaction
		const transaction = await walletModel.createTransaction({
			student_id: studentId,
			type: WALLET_TRANSACTION_TYPE.WITHDRAWAL,
			amount,
			balance_before: balance,
			balance_after: newBalance,
			payment_reference: reference,
			status: WALLET_TRANSACTION_STATUS.COMPLETED,
			description: `Wallet withdrawal of \u20A6${amount.toLocaleString()}`,
		});

		return transaction;
	}

	// --- Transaction History ---

	async getTransactionHistory(studentId, page = 1, limit = 20) {
		const offset = (page - 1) * limit;
		const { data, count } = await walletModel.getTransactionHistory(studentId, limit, offset);

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

module.exports = new WalletService();
