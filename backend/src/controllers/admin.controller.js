const adminService = require('../services/admin.service');
const { successResponse } = require('../utils/responseFormatter');
const { KYC_STATUS } = require('../types/enums');

class AdminController {
  async login(req, res, next) {
    try {
      const { email, password } = req.validatedData;
      const result = await adminService.login(email, password);
      successResponse(res, result, 'Admin login successful');
    } catch (error) {
      next(error);
    }
  }

  async getDashboardStats(req, res, next) {
    try {
      const stats = await adminService.getDashboardStats();
      successResponse(res, stats, 'Dashboard statistics retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getPendingKyc(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const result = await adminService.getPendingKyc(page, limit);
      successResponse(res, result, 'Pending KYC submissions retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getKycDetails(req, res, next) {
    try {
      const { id } = req.params;
      const kyc = await adminService.getKycDetails(id);
      successResponse(res, { kyc }, 'KYC details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async approveKyc(req, res, next) {
    try {
      const { id } = req.params;
      const { admin_notes } = req.body || {};
      const kyc = await adminService.approveKyc(id, req.user.id, admin_notes);
      successResponse(res, { kyc }, 'KYC approved successfully');
    } catch (error) {
      next(error);
    }
  }

  async rejectKyc(req, res, next) {
    try {
      const { id } = req.params;
      const { status, rejection_reason, admin_notes } = req.validatedData;

      let kyc;
      if (status === KYC_STATUS.REJECTED) {
        kyc = await adminService.rejectKyc(id, req.user.id, rejection_reason, admin_notes);
      } else if (status === KYC_STATUS.RESUBMISSION_REQUIRED) {
        kyc = await adminService.requestResubmission(id, req.user.id, rejection_reason, admin_notes);
      }

      successResponse(res, { kyc }, 'KYC review completed successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
