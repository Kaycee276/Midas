const { Bachs } = require('@bachs/sdk');
const logger = require('../utils/logger');

const apiKey = process.env.BACHS_API_KEY || '';
const environment = process.env.BACHS_ENVIRONMENT || 'sandbox';
const webhookSecret = process.env.BACHS_WEBHOOK_SECRET || '';

let bachsClient = null;

if (apiKey && apiKey !== 'sk_sandbox_placeholder') {
  try {
    bachsClient = new Bachs({
      apiKey,
      environment,
    });
    logger.info(`Bachs SDK initialized in ${environment} mode`);
  } catch (err) {
    logger.error('Failed to initialize Bachs SDK', { error: err.message });
  }
}

module.exports = {
  bachsClient,
  apiKey,
  environment,
  webhookSecret,
};
