const express = require('express');
const router = express.Router();
const merchantWalletController = require('../controllers/merchant-wallet.controller');
const { validate } = require('../middleware/validation');
const { verifyToken, requireMerchant } = require('../middleware/auth');
const { withdrawSchema } = require('../validators/merchant-wallet.validator');

// All merchant wallet routes require merchant authentication
router.use(verifyToken, requireMerchant);

router.get('/', merchantWalletController.getWalletInfo);

router.post('/withdraw', validate(withdrawSchema), merchantWalletController.withdrawFunds);

router.get('/transactions', merchantWalletController.getTransactionHistory);

module.exports = router;
