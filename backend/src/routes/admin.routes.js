const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { validate } = require('../middleware/validation');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');
const { adminLoginSchema, kycReviewSchema } = require('../validators/admin.validator');

router.post(
  '/login',
  loginLimiter,
  validate(adminLoginSchema),
  adminController.login
);

router.get(
  '/dashboard/stats',
  verifyToken,
  requireAdmin,
  adminController.getDashboardStats
);

router.get(
  '/kyc/pending',
  verifyToken,
  requireAdmin,
  adminController.getPendingKyc
);

router.get(
  '/kyc/:id',
  verifyToken,
  requireAdmin,
  adminController.getKycDetails
);

router.post(
  '/kyc/:id/approve',
  verifyToken,
  requireAdmin,
  adminController.approveKyc
);

router.post(
  '/kyc/:id/reject',
  verifyToken,
  requireAdmin,
  validate(kycReviewSchema),
  adminController.rejectKyc
);

// Revenue management
router.get(
  '/revenue/pending',
  verifyToken,
  requireAdmin,
  adminController.getPendingRevenue
);

router.post(
  '/revenue/:id/approve',
  verifyToken,
  requireAdmin,
  adminController.approveRevenue
);

router.post(
  '/revenue/:id/reject',
  verifyToken,
  requireAdmin,
  adminController.rejectRevenue
);

router.post(
  '/revenue/:id/distribute',
  verifyToken,
  requireAdmin,
  adminController.distributeRevenue
);

// Platform wallet
router.get(
  '/platform-wallet',
  verifyToken,
  requireAdmin,
  adminController.getPlatformWallet
);

// Analytics
router.get(
  '/analytics',
  verifyToken,
  requireAdmin,
  adminController.getAnalytics
);

module.exports = router;
