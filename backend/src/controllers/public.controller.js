const publicService = require('../services/public.service');
const { successResponse } = require('../utils/responseFormatter');

class PublicController {
  async getActiveMerchants(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const filters = {
        business_type: req.query.business_type,
        proximity_to_campus: req.query.proximity,
        search: req.query.search
      };

      const result = await publicService.getActiveMerchants(page, limit, filters);
      successResponse(res, result, 'Merchants retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMerchantDetails(req, res, next) {
    try {
      const { id } = req.params;
      const merchant = await publicService.getMerchantDetails(id);
      successResponse(res, { merchant }, 'Merchant details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getBusinessTypes(req, res, next) {
    try {
      const types = await publicService.getBusinessTypes();
      successResponse(res, { business_types: types }, 'Business types retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PublicController();
