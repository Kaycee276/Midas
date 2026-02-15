const investmentModel = require('../models/investment.model');
const merchantModel = require('../models/merchant.model');
const studentModel = require('../models/student.model');
const walletModel = require('../models/wallet.model');
const merchantWalletModel = require('../models/merchant-wallet.model');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { INVESTMENT_STATUS, ACCOUNT_STATUS, WALLET_TRANSACTION_TYPE, MERCHANT_WALLET_TRANSACTION_TYPE, WALLET_TRANSACTION_STATUS } = require('../types/enums');

class InvestmentService {
  // Default price per share (can be dynamic in future)
  DEFAULT_PRICE_PER_SHARE = 100;

  async createInvestment(studentId, investmentData) {
    // Verify student exists
    const student = await studentModel.findById(studentId);
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    if (student.account_status === 'suspended') {
      throw new ValidationError('Your account is suspended');
    }

    // Verify merchant exists and is active
    const merchant = await merchantModel.findById(investmentData.merchant_id);
    if (!merchant) {
      throw new NotFoundError('Merchant not found');
    }

    if (merchant.account_status !== ACCOUNT_STATUS.ACTIVE) {
      throw new ValidationError('Merchant is not accepting investments at this time');
    }

    // Check wallet balance
    const walletBalance = parseFloat(student.wallet_balance) || 0;
    if (walletBalance < investmentData.amount) {
      throw new ValidationError('Insufficient wallet balance. Please fund your wallet first.');
    }

    // Deduct from wallet atomically
    const newBalance = await walletModel.deductBalance(studentId, investmentData.amount);

    // Calculate shares based on amount and price per share
    const pricePerShare = this.DEFAULT_PRICE_PER_SHARE;
    const shares = investmentData.amount / pricePerShare;

    // Create investment
    const investment = await investmentModel.create({
      student_id: studentId,
      merchant_id: investmentData.merchant_id,
      amount: investmentData.amount,
      shares: shares,
      price_per_share: pricePerShare,
      status: INVESTMENT_STATUS.ACTIVE,
      current_value: investmentData.amount, // Initially same as invested amount
      return_amount: 0,
      return_percentage: 0,
      notes: investmentData.notes
    });

    // Record student wallet transaction
    await walletModel.createTransaction({
      student_id: studentId,
      type: WALLET_TRANSACTION_TYPE.INVESTMENT_DEBIT,
      amount: investmentData.amount,
      balance_before: walletBalance,
      balance_after: newBalance,
      status: WALLET_TRANSACTION_STATUS.COMPLETED,
      investment_id: investment.id,
      description: `Investment in ${merchant.business_name}`,
    });

    // Credit merchant wallet
    const merchantBalanceBefore = parseFloat(merchant.wallet_balance) || 0;
    const merchantNewBalance = await merchantWalletModel.creditBalance(merchant.id, investmentData.amount);

    await merchantWalletModel.createTransaction({
      merchant_id: merchant.id,
      type: MERCHANT_WALLET_TRANSACTION_TYPE.INVESTMENT_CREDIT,
      amount: investmentData.amount,
      balance_before: merchantBalanceBefore,
      balance_after: merchantNewBalance,
      status: WALLET_TRANSACTION_STATUS.COMPLETED,
      investment_id: investment.id,
      description: `Investment from ${student.full_name}`,
    });

    // Fetch full investment details
    const fullInvestment = await investmentModel.findById(investment.id);

    return fullInvestment;
  }

  async getPortfolio(studentId) {
    const student = await studentModel.findById(studentId);
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    // Get all investments
    const investments = await investmentModel.findByStudentId(studentId);

    // Get portfolio summary
    const summary = await investmentModel.getPortfolioSummary(studentId);

    return {
      summary: summary || {
        total_investments: 0,
        total_invested: 0,
        current_portfolio_value: 0,
        total_returns: 0,
        average_return_percentage: 0,
        active_investments: 0
      },
      investments
    };
  }

  async getInvestmentDetails(investmentId, studentId) {
    const investment = await investmentModel.findById(investmentId);

    if (!investment) {
      throw new NotFoundError('Investment not found');
    }

    // Verify ownership
    if (investment.student_id !== studentId) {
      throw new ValidationError('You do not have access to this investment');
    }

    return investment;
  }

  async getInvestmentHistory(studentId, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const { data, count } = await investmentModel.getTransactionHistory(studentId, limit, offset);

    return {
      transactions: data,
      pagination: {
        total: count,
        page,
        limit,
        total_pages: Math.ceil(count / limit)
      }
    };
  }

  async getMerchantInvestments(merchantId, page = 1, limit = 20) {
    const merchant = await merchantModel.findById(merchantId);
    if (!merchant) {
      throw new NotFoundError('Merchant not found');
    }

    const offset = (page - 1) * limit;
    const { data, count } = await investmentModel.findByMerchantId(merchantId, limit, offset);

    // Get summary
    const summary = await investmentModel.getMerchantInvestmentSummary(merchantId);

    return {
      summary: summary || {
        total_investors: 0,
        total_investments: 0,
        total_capital_raised: 0,
        total_shares_issued: 0,
        active_investments: 0
      },
      investments: data,
      pagination: {
        total: count,
        page,
        limit,
        total_pages: Math.ceil(count / limit)
      }
    };
  }

  async withdrawInvestment(investmentId, studentId) {
    const investment = await investmentModel.findById(investmentId);

    if (!investment) {
      throw new NotFoundError('Investment not found');
    }

    // Verify ownership
    if (investment.student_id !== studentId) {
      throw new ValidationError('You do not have access to this investment');
    }

    if (investment.status !== INVESTMENT_STATUS.ACTIVE) {
      throw new ValidationError('Investment is not active');
    }

    // Credit current value back to wallet
    const currentValue = parseFloat(investment.current_value) || parseFloat(investment.amount);
    const student = await studentModel.findById(studentId);
    const balanceBefore = parseFloat(student.wallet_balance) || 0;
    const newBalance = await walletModel.creditBalance(studentId, currentValue);

    // Update status to withdrawn
    const updatedInvestment = await investmentModel.update(investmentId, {
      status: INVESTMENT_STATUS.WITHDRAWN
    });

    // Record wallet transaction
    await walletModel.createTransaction({
      student_id: studentId,
      type: WALLET_TRANSACTION_TYPE.INVESTMENT_REFUND,
      amount: currentValue,
      balance_before: balanceBefore,
      balance_after: newBalance,
      status: WALLET_TRANSACTION_STATUS.COMPLETED,
      investment_id: investmentId,
      description: `Investment withdrawal from ${investment.merchant?.business_name || 'merchant'}`,
    });

    return updatedInvestment;
  }

  // Calculate portfolio stats
  calculateStats(investments) {
    const active = investments.filter(inv => inv.status === INVESTMENT_STATUS.ACTIVE);

    const totalInvested = investments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
    const currentValue = active.reduce((sum, inv) => sum + parseFloat(inv.current_value || inv.amount), 0);
    const totalReturns = currentValue - totalInvested;
    const returnPercentage = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

    return {
      total_invested: totalInvested,
      current_value: currentValue,
      total_returns: totalReturns,
      return_percentage: returnPercentage.toFixed(2),
      total_investments: investments.length,
      active_investments: active.length
    };
  }
}

module.exports = new InvestmentService();
