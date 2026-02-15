const investmentService = require('../services/investment.service');
const { successResponse } = require('../utils/responseFormatter');

class InvestmentController {
  async createInvestment(req, res, next) {
    try {
      const investment = await investmentService.createInvestment(
        req.user.id,
        req.validatedData
      );
      successResponse(res, { investment }, 'Investment created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getPortfolio(req, res, next) {
    try {
      const portfolio = await investmentService.getPortfolio(req.user.id);
      successResponse(res, portfolio, 'Portfolio retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getInvestmentDetails(req, res, next) {
    try {
      const { id } = req.params;
      const investment = await investmentService.getInvestmentDetails(id, req.user.id);
      successResponse(res, { investment }, 'Investment details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getInvestmentHistory(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const history = await investmentService.getInvestmentHistory(req.user.id, page, limit);
      successResponse(res, history, 'Investment history retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMerchantInvestments(req, res, next) {
    try {
      const { merchantId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const result = await investmentService.getMerchantInvestments(merchantId, page, limit);
      successResponse(res, result, 'Merchant investments retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async withdrawInvestment(req, res, next) {
    try {
      const { id } = req.params;
      const investment = await investmentService.withdrawInvestment(id, req.user.id);
      successResponse(res, { investment }, 'Investment withdrawn successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InvestmentController();
