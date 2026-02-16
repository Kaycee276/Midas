const cron = require("node-cron");
const revenueModel = require("../models/revenue.model");
const distributionService = require("../services/distribution.service");
const logger = require("../utils/logger");

const startDividendDistributionJob = () => {
	// Run on the 1st of every month at midnight
	cron.schedule("* * * * *", async () => {
		logger.info("Dividend distribution job started");

		try {
			const reports = await revenueModel.findApprovedUndistributed();

			if (!reports || reports.length === 0) {
				logger.info("No approved undistributed reports found");
				return;
			}

			logger.info(`Found ${reports.length} approved reports to distribute`);

			for (const report of reports) {
				try {
					await distributionService.distributeProfit(report.id, null);
					logger.info(
						`Successfully distributed report ${report.id} for merchant ${report.merchant?.business_name || report.merchant_id}`,
					);
				} catch (error) {
					logger.error(`Failed to distribute report ${report.id}:`, error);
				}
			}

			logger.info("Dividend distribution job completed");
		} catch (error) {
			logger.error("Dividend distribution job failed:", error);
		}
	});

	logger.info(
		"Dividend distribution cron job scheduled (1st of every month at midnight)",
	);
};

module.exports = { startDividendDistributionJob };
