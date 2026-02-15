const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const kycRoutes = require('./kyc.routes');
const adminRoutes = require('./admin.routes');
const studentRoutes = require('./student.routes');
const publicRoutes = require('./public.routes');
const investmentRoutes = require('./investment.routes');

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

module.exports = router;
