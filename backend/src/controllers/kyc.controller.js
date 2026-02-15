const kycService = require('../services/kyc.service');
const { successResponse } = require('../utils/responseFormatter');

class KycController {
  async submitKyc(req, res, next) {
    try {
      const kyc = await kycService.submitKyc(
        req.user.id,
        req.validatedData,
        req.files
      );
      successResponse(res, { kyc }, 'KYC submitted successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getKycStatus(req, res, next) {
    try {
      const kyc = await kycService.getKycStatus(req.user.id);
      successResponse(res, { kyc }, 'KYC status retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getDocument(req, res, next) {
    try {
      const { type } = req.params;
      const document = await kycService.getDocument(req.user.id, type);
      successResponse(res, document, 'Document retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteDocument(req, res, next) {
    try {
      const { type } = req.params;
      const result = await kycService.deleteDocument(req.user.id, type);
      successResponse(res, result, 'Document deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new KycController();
