const investmentModel = require('../models/investment.model');
const merchantModel = require('../models/merchant.model');
const studentModel = require('../models/student.model');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { INVESTMENT_STATUS, ACCOUNT_STATUS } = require('../types/enums');

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

    // Update status to withdrawn
    const updatedInvestment = await investmentModel.update(investmentId, {
      status: INVESTMENT_STATUS.WITHDRAWN
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
