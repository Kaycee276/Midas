const studentService = require('../services/student.service');
const { successResponse } = require('../utils/responseFormatter');

class StudentController {
  async register(req, res, next) {
    try {
      const result = await studentService.register(req.validatedData);
      successResponse(res, result, 'Student registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.validatedData;
      const result = await studentService.login(email, password);
      successResponse(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const student = await studentService.getProfile(req.user.id);
      successResponse(res, { student }, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const student = await studentService.updateProfile(req.user.id, req.validatedData);
      successResponse(res, { student }, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StudentController();
