const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { validate } = require('../src/middleware/validation');
const errorHandler = require('../src/middleware/errorHandler');
const {
  verifyToken,
  requireMerchant,
  requireAdmin,
  requireStudent,
} = require('../src/middleware/auth');
const { AppError, ValidationError } = require('../src/utils/errors');

describe('Backend Middleware', () => {
  describe('validate middleware', () => {
    const testSchema = Joi.object({
      name: Joi.string().required(),
      age: Joi.number().min(18).required(),
    });

    it('should set req.validatedData and call next when input is valid', () => {
      const middleware = validate(testSchema);
      const req = { body: { name: 'Alice', age: 20, extra: 'ignored' } };
      const res = {};
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.validatedData).toEqual({ name: 'Alice', age: 20 });
    });

    it('should call next with ValidationError when input is invalid', () => {
      const middleware = validate(testSchema);
      const req = { body: { name: 'Alice', age: 10 } };
      const res = {};
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(ValidationError);
      expect(err.statusCode).toBe(400);
      expect(err.errors).toBeDefined();
    });
  });

  describe('errorHandler middleware', () => {
    it('should format operational error responses correctly', () => {
      const err = new AppError('Custom operational failure', 400);
      const req = { path: '/test', method: 'GET' };
      const jsonMock = jest.fn();
      const res = {
        status: jest.fn().mockReturnValue({ json: jsonMock }),
      };
      const next = jest.fn();

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Custom operational failure',
        })
      );
    });

    it('should sanitize non-operational error messages to Internal server error', () => {
      const err = new Error('Database connection crashed');
      const req = { path: '/test', method: 'GET' };
      const jsonMock = jest.fn();
      const res = {
        status: jest.fn().mockReturnValue({ json: jsonMock }),
      };
      const next = jest.fn();

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Internal server error',
        })
      );
    });
  });

  describe('auth middleware', () => {
    const secret = process.env.JWT_SECRET || 'test-jwt-secret-key-1234567890';

    describe('verifyToken', () => {
      it('should reject requests without authorization header', () => {
        const req = { headers: {} };
        const res = {};
        const next = jest.fn();

        verifyToken(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        const err = next.mock.calls[0][0];
        expect(err.statusCode).toBe(401);
        expect(err.message).toBe('No token provided');
      });

      it('should decode valid JWT and set req.user', () => {
        const payload = { id: 'user-123', email: 'user@test.com', type: 'student' };
        const token = jwt.sign(payload, secret);
        const req = { headers: { authorization: `Bearer ${token}` } };
        const res = {};
        const next = jest.fn();

        verifyToken(req, res, next);

        expect(next).toHaveBeenCalledWith();
        expect(req.user).toBeDefined();
        expect(req.user.id).toBe('user-123');
        expect(req.user.type).toBe('student');
      });

      it('should reject invalid JWT tokens', () => {
        const req = { headers: { authorization: 'Bearer invalid.token.value' } };
        const res = {};
        const next = jest.fn();

        verifyToken(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        const err = next.mock.calls[0][0];
        expect(err.statusCode).toBe(401);
        expect(err.message).toBe('Invalid token');
      });
    });

    describe('role checking middleware', () => {
      it('requireMerchant should allow merchants and reject non-merchants', () => {
        const next1 = jest.fn();
        requireMerchant({ user: { type: 'merchant' } }, {}, next1);
        expect(next1).toHaveBeenCalledWith();

        const next2 = jest.fn();
        requireMerchant({ user: { type: 'student' } }, {}, next2);
        expect(next2.mock.calls[0][0].statusCode).toBe(403);
      });

      it('requireStudent should allow students and reject non-students', () => {
        const next1 = jest.fn();
        requireStudent({ user: { type: 'student' } }, {}, next1);
        expect(next1).toHaveBeenCalledWith();

        const next2 = jest.fn();
        requireStudent({ user: { type: 'admin' } }, {}, next2);
        expect(next2.mock.calls[0][0].statusCode).toBe(403);
      });

      it('requireAdmin should allow admins and reject non-admins', () => {
        const next1 = jest.fn();
        requireAdmin({ user: { type: 'admin' } }, {}, next1);
        expect(next1).toHaveBeenCalledWith();

        const next2 = jest.fn();
        requireAdmin({ user: { type: 'merchant' } }, {}, next2);
        expect(next2.mock.calls[0][0].statusCode).toBe(403);
      });
    });
  });
});
