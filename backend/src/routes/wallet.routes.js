const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const { validate } = require('../middleware/validation');
const { verifyToken, requireStudent } = require('../middleware/auth');
const { fundWalletSchema, withdrawSchema } = require('../validators/wallet.validator');

// All wallet routes require student authentication
router.use(verifyToken, requireStudent);

router.get('/', walletController.getWalletInfo);

router.post('/fund', validate(fundWalletSchema), walletController.fundWallet);

router.post('/withdraw', validate(withdrawSchema), walletController.withdrawFunds);

router.get('/transactions', walletController.getTransactionHistory);

module.exports = router;
