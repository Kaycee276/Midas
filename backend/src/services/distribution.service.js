const revenueModel = require('../models/revenue.model');
const distributionModel = require('../models/distribution.model');
const platformWalletModel = require('../models/platform-wallet.model');
const walletModel = require('../models/wallet.model');
const merchantWalletModel = require('../models/merchant-wallet.model');
const investmentModel = require('../models/investment.model');
const studentModel = require('../models/student.model');
const merchantModel = require('../models/merchant.model');
const { NotFoundError, ValidationError } = require('../utils/errors');
const {
	REVENUE_REPORT_STATUS,
	DISTRIBUTION_STATUS,
	WALLET_TRANSACTION_TYPE,
	MERCHANT_WALLET_TRANSACTION_TYPE,
	WALLET_TRANSACTION_STATUS,
	PLATFORM_TRANSACTION_TYPE
} = require('../types/enums');
const logger = require('../utils/logger');
const { emitDashboardUpdate } = require('../config/socket');

class DistributionService {
	async distributeProfit(revenueReportId, adminId) {
		// 1. Load revenue report
		const report = await revenueModel.findById(revenueReportId);
		if (!report) {
			throw new NotFoundError('Revenue report not found');
		}
		if (report.status !== REVENUE_REPORT_STATUS.APPROVED) {
			throw new ValidationError('Only approved reports can be distributed');
		}

		const netProfit = Number(report.net_profit);
		if (netProfit <= 0) {
			throw new ValidationError('No profit to distribute');
		}

		// 2. Calculate shares
		const merchantShare = Math.round(netProfit * 0.65 * 100) / 100;
		const investorPool = Math.round(netProfit * 0.30 * 100) / 100;
		const platformShare = Math.round(netProfit * 0.05 * 100) / 100;

		// 3. Get all active investments for this merchant
		const { data: investments } = await investmentModel.findByMerchantId(report.merchant_id, 10000, 0);
		const activeInvestments = (investments || []).filter(inv => inv.status === 'active');

		if (activeInvestments.length === 0) {
			throw new ValidationError('No active investments found for this merchant');
		}

		// Calculate total shares
		const totalShares = activeInvestments.reduce((sum, inv) => sum + Number(inv.shares), 0);

		// Verify merchant has sufficient balance for distribution
		const merchantRecord = await merchantModel.findById(report.merchant_id);
		const merchantBalance = parseFloat(merchantRecord.wallet_balance) || 0;
		const requiredDebit = investorPool + platformShare;
		if (merchantBalance < requiredDebit) {
			throw new ValidationError(
				`Insufficient merchant balance for distribution. Required: ₦${requiredDebit}, Available: ₦${merchantBalance}`
			);
		}

		// 4. Create distribution record
		const distribution = await distributionModel.create({
			revenue_report_id: revenueReportId,
			merchant_id: report.merchant_id,
			total_profit: netProfit,
			merchant_share: merchantShare,
			investor_share_pool: investorPool,
			platform_share: platformShare,
			status: DISTRIBUTION_STATUS.PENDING
		});

		try {
			// 5. Distribute to each investor
			for (const investment of activeInvestments) {
				const sharesHeld = Number(investment.shares);
				const payoutAmount = Math.round((sharesHeld / totalShares) * investorPool * 100) / 100;

				if (payoutAmount <= 0) continue;

				// Get balance before credit
				const student = await studentModel.findById(investment.student_id);
				const studentBalanceBefore = parseFloat(student.wallet_balance) || 0;

				// Credit student wallet
				const studentNewBalance = await walletModel.creditBalance(investment.student_id, payoutAmount);

				// Record student wallet transaction
				await walletModel.createTransaction({
					student_id: investment.student_id,
					type: WALLET_TRANSACTION_TYPE.DIVIDEND_CREDIT,
					amount: payoutAmount,
					balance_before: studentBalanceBefore,
					balance_after: studentNewBalance,
					status: WALLET_TRANSACTION_STATUS.COMPLETED,
					investment_id: investment.id,
					description: `Dividend from ${report.merchant?.business_name || 'merchant'}`
				});

				// Record individual payout
				await distributionModel.createPayout({
					distribution_id: distribution.id,
					investment_id: investment.id,
					student_id: investment.student_id,
					merchant_id: report.merchant_id,
					amount: payoutAmount,
					shares_held: sharesHeld,
					total_shares: totalShares,
					status: 'completed'
				});

				// Update investment return_amount and return_percentage
				const currentReturn = Number(investment.return_amount) || 0;
				const newReturn = currentReturn + payoutAmount;
				const returnPercentage = Math.round((newReturn / Number(investment.amount)) * 100 * 100) / 100;

				await investmentModel.update(investment.id, {
					return_amount: newReturn,
					return_percentage: returnPercentage
				});
			}

			// 6. Debit merchant wallet for investor + platform portion
			const merchantDebit = investorPool + platformShare;
			const merchant = await merchantModel.findById(report.merchant_id);
			const merchantBalanceBefore = parseFloat(merchant.wallet_balance) || 0;
			const merchantNewBalance = await merchantWalletModel.deductBalance(report.merchant_id, merchantDebit);

			// Record merchant wallet transaction
			await merchantWalletModel.createTransaction({
				merchant_id: report.merchant_id,
				type: MERCHANT_WALLET_TRANSACTION_TYPE.DIVIDEND_DEBIT,
				amount: merchantDebit,
				balance_before: merchantBalanceBefore,
				balance_after: merchantNewBalance,
				status: WALLET_TRANSACTION_STATUS.COMPLETED,
				description: `Profit distribution - investor shares + platform commission`
			});

			// 7. Credit platform wallet
			const wallet = await platformWalletModel.getBalance();
			const balanceBefore = Number(wallet.balance);
			const newBalance = await platformWalletModel.creditBalance(platformShare);

			await platformWalletModel.createTransaction({
				type: PLATFORM_TRANSACTION_TYPE.COMMISSION,
				amount: platformShare,
				balance_before: balanceBefore,
				balance_after: newBalance,
				reference_id: distribution.id,
				description: `5% commission from ${report.merchant?.business_name || 'merchant'}`
			});

			// 8. Update distribution status
			await distributionModel.updateStatus(distribution.id, DISTRIBUTION_STATUS.COMPLETED, {
				distributed_at: new Date().toISOString()
			});

			// 9. Update revenue report status
			await revenueModel.updateStatus(revenueReportId, REVENUE_REPORT_STATUS.DISTRIBUTED);

			logger.info(`Distribution completed for report ${revenueReportId}: merchant=${merchantShare}, investors=${investorPool}, platform=${platformShare}`);

			emitDashboardUpdate();

			return distribution;
		} catch (error) {
			// Mark distribution as failed
			await distributionModel.updateStatus(distribution.id, DISTRIBUTION_STATUS.FAILED);
			logger.error(`Distribution failed for report ${revenueReportId}:`, error);
			throw error;
		}
	}
}

module.exports = new DistributionService();
