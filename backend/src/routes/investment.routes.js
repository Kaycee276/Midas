const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investment.controller');
const { validate } = require('../middleware/validation');
const { verifyToken, requireStudent } = require('../middleware/auth');
const { createInvestmentSchema } = require('../validators/investment.validator');

// All investment routes require student authentication

router.post(
  '/',
  verifyToken,
  requireStudent,
  validate(createInvestmentSchema),
  investmentController.createInvestment
);

router.get(
  '/portfolio',
  verifyToken,
  requireStudent,
  investmentController.getPortfolio
);

router.get(
  '/history',
  verifyToken,
  requireStudent,
  investmentController.getInvestmentHistory
);

router.get(
  '/:id',
  verifyToken,
  requireStudent,
  investmentController.getInvestmentDetails
);

router.post(
  '/:id/withdraw',
  verifyToken,
  requireStudent,
  investmentController.withdrawInvestment
);

// Public route to view merchant's investments (summary)
router.get(
  '/merchants/:merchantId',
  investmentController.getMerchantInvestments
);

module.exports = router;
