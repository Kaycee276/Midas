const { webhooks, BachsWebhookError } = require('@bachs/sdk');
const bachsService = require('../services/bachs.service');
const { webhookSecret } = require('../config/bachs');
const { successResponse } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

class PaymentController {
  /**
   * Bachs Webhook Endpoint
   * Complies with Bachs webhook signature verification rules:
   * - Verifies X-Bachs-Signature-V2 on the raw unparsed request body
   * - Validates timestamp tolerance and all v1 signatures
   * - Returns 2xx once accepted/handled
   * - Returns 5xx on internal processing failure so Bachs retries
   */
  async handleBachsWebhook(req, res) {
    let event;

    try {
      const rawBody = req.rawBody;

      if (!rawBody) {
        logger.error('Bachs webhook error: rawBody missing');
        return res.status(400).send('Raw body is required for signature verification');
      }

      // If a webhook secret is configured, strictly verify signature
      if (webhookSecret) {
        event = webhooks.constructEvent(rawBody, req.headers, webhookSecret);
      } else {
        // In local development before secret is configured, parse JSON from raw buffer
        event = JSON.parse(rawBody.toString('utf8'));
        logger.warn(
          'Processing Bachs webhook without signature verification (BACHS_WEBHOOK_SECRET not set)'
        );
      }
    } catch (err) {
      if (err instanceof BachsWebhookError) {
        logger.warn('Bachs webhook signature verification failed', { error: err.message });
        return res.status(400).send(`Invalid signature: ${err.message}`);
      }
      logger.error('Error constructing Bachs webhook event', { error: err.message });
      return res.status(400).send('Invalid webhook payload');
    }

    try {
      logger.info('Bachs webhook event received', {
        id: event.id,
        type: event.type,
      });

      const result = await bachsService.handleWebhookEvent(event);

      // Notify frontend via Socket.io if available
      const io = req.app.get('io');
      if (io && result.handled && result.reference) {
        io.emit(`payment:${result.reference}`, {
          status: 'completed',
          reference: result.reference,
          balance_after: result.balance_after,
        });
      }

      return res.status(200).json({ received: true });
    } catch (err) {
      logger.error('Failed to process Bachs webhook event', {
        error: err.message,
        stack: err.stack,
        eventId: event?.id,
      });
      // Return 500 so Bachs retries delivery according to its documented retry policy
      const statusCode = err.statusCode || 500;
      return res.status(statusCode).send('Failed to process event');
    }
  }

  /**
   * Retrieve status of a Bachs checkout / deposit
   */
  async getCheckoutStatus(req, res, next) {
    try {
      const { reference } = req.params;
      const status = await bachsService.getCheckoutStatus(reference);
      successResponse(res, status, 'Checkout status retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Developer / Demo Sandbox Simulator:
   * Allows triggering a simulated completion for a pending deposit in sandbox mode
   */
  async simulateSandboxPayment(req, res, next) {
    try {
      const { reference } = req.body;
      if (!reference) {
        return res.status(400).json({ success: false, message: 'Reference is required' });
      }

      const syntheticEvent = {
        id: `evt_sim_${Date.now()}`,
        type: 'checkout.completed',
        created_at: new Date().toISOString(),
        data: {
          reference,
          status: 'completed',
        },
      };

      const result = await bachsService.handleWebhookEvent(syntheticEvent);

      const io = req.app.get('io');
      if (io && result.handled) {
        io.emit(`payment:${reference}`, {
          status: 'completed',
          reference,
          balance_after: result.balance_after,
        });
      }

      successResponse(res, result, 'Simulated sandbox deposit completed successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PaymentController();
