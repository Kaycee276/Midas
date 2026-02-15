const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { success: false, message },
    standardHeaders: true,
    legacyHeaders: false
  });
};

const registrationLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  5,
  'Too many registration attempts, please try again later'
);

const loginLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  10,
  'Too many login attempts, please try again later'
);

const generalLimiter = createRateLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  'Too many requests, please try again later'
);

module.exports = {
  registrationLimiter,
  loginLimiter,
  generalLimiter
};
