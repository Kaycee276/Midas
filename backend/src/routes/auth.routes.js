const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate } = require('../middleware/validation');
const { verifyToken, requireMerchant } = require('../middleware/auth');
const { registrationLimiter, loginLimiter } = require('../middleware/rateLimiter');
const {
  merchantRegistrationSchema,
  merchantLoginSchema,
  merchantUpdateSchema
} = require('../validators/merchant.validator');

router.post(
  '/register',
  registrationLimiter,
  validate(merchantRegistrationSchema),
  authController.register
);

router.post(
  '/login',
  loginLimiter,
  validate(merchantLoginSchema),
  authController.login
);

router.get(
  '/me',
  verifyToken,
  requireMerchant,
  authController.getMe
);

router.patch(
  '/profile',
  verifyToken,
  requireMerchant,
  validate(merchantUpdateSchema),
  authController.updateProfile
);

module.exports = router;
