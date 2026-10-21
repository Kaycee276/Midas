const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

// Bachs Webhook endpoint (must receive raw body, no auth token)
router.post('/bachs-webhook', paymentController.handleBachsWebhook);

// Check deposit status by reference or checkout_id
router.get('/status/:reference', paymentController.getCheckoutStatus);

// Developer Sandbox simulation route (for local testing without external tunnel)
router.post('/simulate-sandbox-payment', paymentController.simulateSandboxPayment);

module.exports = router;
