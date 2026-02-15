const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const kycRoutes = require('./kyc.routes');
const adminRoutes = require('./admin.routes');
const studentRoutes = require('./student.routes');
const publicRoutes = require('./public.routes');
const investmentRoutes = require('./investment.routes');
const walletRoutes = require('./wallet.routes');
const merchantWalletRoutes = require('./merchant-wallet.routes');
const revenueRoutes = require('./revenue.routes');

// Health check (also available at /api/health)
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
});

// Public routes (no auth required)
router.use('/public', publicRoutes);

// API routes
router.use('/auth', authRoutes);  // Merchant auth
router.use('/students', studentRoutes);  // Student auth & profile
router.use('/investments', investmentRoutes);  // Investment management
router.use('/kyc', kycRoutes);
router.use('/admin', adminRoutes);
router.use('/wallet', walletRoutes);
router.use('/merchant-wallet', merchantWalletRoutes);
router.use('/revenue', revenueRoutes);

module.exports = router;
