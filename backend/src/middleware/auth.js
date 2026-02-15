const jwt = require('jsonwebtoken');
const { AuthenticationError, AuthorizationError } = require('../utils/errors');

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new AuthenticationError('Invalid token'));
    } else if (error.name === 'TokenExpiredError') {
      next(new AuthenticationError('Token expired'));
    } else {
      next(error);
    }
  }
};

const requireMerchant = (req, res, next) => {
  if (!req.user || req.user.type !== 'merchant') {
    return next(new AuthorizationError('Merchant access required'));
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.type !== 'admin') {
    return next(new AuthorizationError('Admin access required'));
  }
  next();
};

const requireStudent = (req, res, next) => {
  if (!req.user || req.user.type !== 'student') {
    return next(new AuthorizationError('Student access required'));
  }
  next();
};

module.exports = {
  verifyToken,
  requireMerchant,
  requireAdmin,
  requireStudent
};
