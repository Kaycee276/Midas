const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.controller');

// Public routes - no authentication required

router.get(
  '/merchants',
  publicController.getActiveMerchants
);

router.get(
  '/merchants/:id',
  publicController.getMerchantDetails
);

router.get(
  '/business-types',
  publicController.getBusinessTypes
);

module.exports = router;
