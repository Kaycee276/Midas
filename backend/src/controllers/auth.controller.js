const merchantService = require('../services/merchant.service');
const { successResponse } = require('../utils/responseFormatter');

class AuthController {
  async register(req, res, next) {
    try {
      const result = await merchantService.register(req.validatedData);
      successResponse(res, result, 'Merchant registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.validatedData;
      const result = await merchantService.login(email, password);
      successResponse(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const merchant = await merchantService.getProfile(req.user.id);
      successResponse(res, { merchant }, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const merchant = await merchantService.updateProfile(req.user.id, req.validatedData);
      successResponse(res, { merchant }, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
