const crypto = require('crypto');
const prisma = require('../config/prisma');
const { bachsClient } = require('../config/bachs');
const studentModel = require('../models/student.model');
const walletModel = require('../models/wallet.model');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { WALLET_TRANSACTION_TYPE, WALLET_TRANSACTION_STATUS } = require('../types/enums');
const logger = require('../utils/logger');

class BachsService {
  /**
   * Create a Bachs checkout session for funding a student wallet.
   * Conforms strictly to Bachs API rules:
   * - Amounts sent as decimal strings with ISO 4217 currency ("5000.00", "NGN")
   * - Idempotency-Key per business operation
   * - Reference linked to local deposit order
   */
  async createWalletFundingCheckout({ studentId, amount, origin }) {
    const student = await studentModel.findById(studentId);
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    const numAmount = Number(amount);
    if (!numAmount || numAmount < 100) {
      throw new ValidationError('Minimum deposit amount is \u20A6100');
    }

    // Money is always a decimal string at 2 decimal places
    const amountStr = numAmount.toFixed(2);
    const reference = `dep_${crypto.randomUUID()}`;
    const idempotencyKey = `checkout-${reference}`;
    const balanceBefore = parseFloat(student.wallet_balance) || 0;

    // Persist pending transaction in database before creating Bachs session
    const transaction = await walletModel.createTransaction({
      student_id: studentId,
      type: WALLET_TRANSACTION_TYPE.DEPOSIT,
      amount: numAmount,
      balance_before: balanceBefore,
      balance_after: balanceBefore,
      payment_reference: reference,
      status: WALLET_TRANSACTION_STATUS.PENDING,
      description: `Bachs deposit of \u20A6${numAmount.toLocaleString()} (${student.full_name})`,
      metadata: {
        provider: 'bachs',
        idempotency_key: idempotencyKey,
        currency: 'NGN',
        amount_str: amountStr,
      },
    });

    // Check if client is initialized with a live/sandbox API key
    if (bachsClient) {
      try {
        const frontendUrl = process.env.FRONTEND_URL || origin || '';
        // Bachs sandbox refuses localhost/private addresses for redirects; omit them when local
        const isLocal =
          !frontendUrl || frontendUrl.includes('localhost') || frontendUrl.includes('127.0.0.1');

        const redirectOptions = isLocal
          ? {}
          : {
              success_url: `${frontendUrl}/student/wallet?status=success&reference=${reference}`,
              cancel_url: `${frontendUrl}/student/wallet?status=cancelled&reference=${reference}`,
            };

        const session = await bachsClient.checkoutSessions.create(
          {
            pricing: {
              currency: 'NGN',
              amount: amountStr,
            },
            reference,
            customer: {
              email: student.email,
              name: student.full_name,
            },
            metadata: {
              student_id: studentId,
              deposit_id: reference,
            },
            ...redirectOptions,
          },
          { idempotencyKey }
        );

        // Update transaction with session details
        await walletModel.updateTransaction(transaction.id, {
          metadata: {
            ...transaction.metadata,
            checkout_id: session.checkout_id,
            checkout_url: session.checkout_url,
          },
        });

        logger.info('Bachs checkout session created', {
          reference,
          checkout_id: session.checkout_id,
          student_id: studentId,
          amount: amountStr,
        });

        return {
          checkout_url: session.checkout_url,
          checkout_id: session.checkout_id,
          reference,
          is_simulated: false,
        };
      } catch (err) {
        logger.error('Failed to create Bachs checkout session via SDK', {
          error: err.message,
          reference,
        });
        throw err;
      }
    }

    // Fallback: If no BACHS_API_KEY is supplied yet (or in offline development mode),
    // provide a simulated sandbox checkout URL so local development & defense tests work seamlessly.
    const mockCheckoutId = `chk_mock_${crypto.randomUUID().replace(/-/g, '')}`;
    const mockCheckoutUrl = `/student/wallet/fund?mock_checkout=true&checkout_id=${mockCheckoutId}&reference=${reference}&amount=${amountStr}`;

    await walletModel.updateTransaction(transaction.id, {
      metadata: {
        ...transaction.metadata,
        checkout_id: mockCheckoutId,
        checkout_url: mockCheckoutUrl,
        mode: 'simulated_sandbox',
      },
    });

    logger.info('Simulated sandbox checkout session created (BACHS_API_KEY pending)', {
      reference,
      checkout_id: mockCheckoutId,
    });

    return {
      checkout_url: mockCheckoutUrl,
      checkout_id: mockCheckoutId,
      reference,
      is_simulated: true,
    };
  }

  /**
   * Process a verified Bachs webhook event.
   * Handles checkout.completed and collection.succeeded idempotently.
   */
  async handleWebhookEvent(event) {
    const { id: eventId, type: eventType, data } = event;

    if (!['checkout.completed', 'collection.succeeded'].includes(eventType)) {
      return { handled: false, reason: 'unhandled_event_type' };
    }

    const reference = data?.reference;
    const checkoutId = data?.checkout_id;

    if (!reference && !checkoutId) {
      logger.warn('Webhook received without reference or checkout_id', { eventId });
      return { handled: false, reason: 'missing_identifiers' };
    }

    // Find the pending transaction
    const transaction = await prisma.walletTransaction.findFirst({
      where: {
        OR: [
          ...(reference ? [{ payment_reference: reference }] : []),
          ...(checkoutId ? [{ metadata: { path: ['checkout_id'], equals: checkoutId } }] : []),
        ],
      },
      include: {
        student: true,
      },
    });

    if (!transaction) {
      logger.warn('No transaction found matching webhook identifiers', {
        reference,
        checkoutId,
        eventId,
      });
      return { handled: false, reason: 'transaction_not_found' };
    }

    // Idempotency: if already completed, do not credit again
    if (transaction.status === WALLET_TRANSACTION_STATUS.COMPLETED) {
      logger.info('Transaction already completed; skipping duplicate fulfilment', {
        reference: transaction.payment_reference,
        eventId,
      });
      return { handled: true, reason: 'already_completed' };
    }

    // If live/sandbox SDK is active and we have a checkoutId, verify state from Bachs
    if (bachsClient && checkoutId && !checkoutId.startsWith('chk_mock_')) {
      const checkout = await bachsClient.checkoutSessions.get(String(checkoutId));
      if (checkout.status !== 'completed') {
        logger.warn('Checkout not completed yet according to Bachs API', {
          checkoutId,
          status: checkout.status,
        });
        const err = new Error('Checkout not completed yet');
        err.statusCode = 503; // Bachs retries 5xx responses
        throw err;
      }

      // Verify amount and currency match
      const expectedAmount = Number(transaction.amount);
      const paidAmount = Number(checkout.amount);
      if (checkout.currency !== 'NGN' || Math.abs(expectedAmount - paidAmount) > 0.01) {
        logger.error('Amount or currency mismatch during Bachs webhook verification', {
          expected: { amount: expectedAmount, currency: 'NGN' },
          received: { amount: paidAmount, currency: checkout.currency },
          reference: transaction.payment_reference,
        });
        throw new Error('Payment mismatch: amount or currency does not match');
      }
    }

    // Atomically credit student balance and update transaction
    const updated = await prisma.$transaction(async (tx) => {
      // Re-fetch inside transaction for race condition safety
      const currentTx = await tx.walletTransaction.findUnique({
        where: { id: transaction.id },
      });

      if (currentTx.status === WALLET_TRANSACTION_STATUS.COMPLETED) {
        return currentTx;
      }

      const student = await tx.student.findUnique({
        where: { id: transaction.student_id },
        select: { wallet_balance: true },
      });

      const currentBalance = parseFloat(student.wallet_balance) || 0;
      const creditAmount = parseFloat(transaction.amount);
      const newBalance = currentBalance + creditAmount;

      await tx.student.update({
        where: { id: transaction.student_id },
        data: {
          wallet_balance: {
            increment: creditAmount,
          },
        },
      });

      const existingMeta =
        currentTx.metadata && typeof currentTx.metadata === 'object' ? currentTx.metadata : {};

      const eventsProcessed = Array.isArray(existingMeta.events_processed)
        ? [...existingMeta.events_processed, eventId]
        : [eventId];

      return tx.walletTransaction.update({
        where: { id: transaction.id },
        data: {
          status: WALLET_TRANSACTION_STATUS.COMPLETED,
          balance_before: currentBalance,
          balance_after: newBalance,
          metadata: {
            ...existingMeta,
            event_id: eventId,
            events_processed: eventsProcessed,
            fulfilled_at: new Date().toISOString(),
          },
          updated_at: new Date(),
        },
      });
    });

    logger.info('Bachs payment fulfilled successfully', {
      reference: transaction.payment_reference,
      student_id: transaction.student_id,
      amount: transaction.amount,
      balance_after: updated.balance_after,
      eventId,
    });

    return {
      handled: true,
      transaction_id: updated.id,
      reference: transaction.payment_reference,
      balance_after: updated.balance_after,
    };
  }

  /**
   * Check status of a deposit/checkout by reference or checkout_id
   */
  async getCheckoutStatus(referenceOrCheckoutId) {
    const transaction = await prisma.walletTransaction.findFirst({
      where: {
        OR: [
          { payment_reference: referenceOrCheckoutId },
          {
            metadata: {
              path: ['checkout_id'],
              equals: referenceOrCheckoutId,
            },
          },
        ],
      },
      select: {
        id: true,
        payment_reference: true,
        amount: true,
        status: true,
        balance_after: true,
        created_at: true,
        updated_at: true,
        metadata: true,
      },
    });

    if (!transaction) {
      throw new NotFoundError('Transaction not found');
    }

    return transaction;
  }
}

module.exports = new BachsService();
