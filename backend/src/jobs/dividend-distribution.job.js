const cron = require('node-cron');
const revenueModel = require('../models/revenue.model');
const distributionService = require('../services/distribution.service');
const logger = require('../utils/logger');

/**
 * Executes the annual dividend distribution for all approved, undistributed revenue reports.
 * Profits are distributed annually: 65% to merchant, 30% to active student investors, 5% to platform.
 */
const executeAnnualDividendDistribution = async () => {
  logger.info('Annual dividend distribution job started');

  try {
    const reports = await revenueModel.findApprovedUndistributed();

    if (!reports || reports.length === 0) {
      logger.info('No approved undistributed annual reports found');
      return { totalDistributed: 0, reportsCount: 0 };
    }

    logger.info(`Found ${reports.length} approved reports for annual distribution`);
    let successfulCount = 0;

    for (const report of reports) {
      try {
        await distributionService.distributeProfit(report.id, null);
        successfulCount++;
        logger.info(
          `Successfully distributed annual report ${report.id} for merchant ${report.merchant?.business_name || report.merchant_id}`
        );
      } catch (error) {
        logger.error(`Failed to distribute annual report ${report.id}:`, error);
      }
    }

    logger.info(
      `Annual dividend distribution job completed (${successfulCount}/${reports.length} distributed)`
    );
    return { totalDistributed: successfulCount, reportsCount: reports.length };
  } catch (error) {
    logger.error('Annual dividend distribution job failed:', error);
    throw error;
  }
};

/**
 * Initializes the yearly cron schedule.
 * Runs annually on January 1st at midnight (00:00).
 */
const startDividendDistributionJob = () => {
  // Run annually on January 1st at midnight (00:00)
  cron.schedule('0 0 1 1 *', async () => {
    try {
      await executeAnnualDividendDistribution();
    } catch (error) {
      logger.error('Scheduled annual dividend distribution error:', error);
    }
  });

  logger.info(
    'Annual dividend distribution cron job scheduled (annually on January 1st at midnight)'
  );
};

module.exports = {
  startDividendDistributionJob,
  executeAnnualDividendDistribution,
};
