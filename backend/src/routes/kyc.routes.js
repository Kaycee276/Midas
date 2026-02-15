const express = require('express');
const router = express.Router();
const kycController = require('../controllers/kyc.controller');
const { validate } = require('../middleware/validation');
const { verifyToken, requireMerchant } = require('../middleware/auth');
const { uploadFields } = require('../middleware/upload');
const { kycSubmissionSchema } = require('../validators/kyc.validator');

router.post(
  '/submit',
  verifyToken,
  requireMerchant,
  uploadFields,
  validate(kycSubmissionSchema),
  kycController.submitKyc
);

router.get(
  '/status',
  verifyToken,
  requireMerchant,
  kycController.getKycStatus
);

router.get(
  '/documents/:type',
  verifyToken,
  requireMerchant,
  kycController.getDocument
);

router.delete(
  '/document/:type',
  verifyToken,
  requireMerchant,
  kycController.deleteDocument
);

module.exports = router;
