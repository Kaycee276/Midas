jest.mock('node-cron', () => ({
  schedule: jest.fn(),
}));

jest.mock('../src/models/revenue.model', () => ({
  findApprovedUndistributed: jest.fn(),
}));

jest.mock('../src/services/distribution.service', () => ({
  distributeProfit: jest.fn(),
}));

const cron = require('node-cron');
const revenueModel = require('../src/models/revenue.model');
const distributionService = require('../src/services/distribution.service');
const {
  startDividendDistributionJob,
  executeAnnualDividendDistribution,
} = require('../src/jobs/dividend-distribution.job');

describe('Yearly Dividend Distribution Job', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('startDividendDistributionJob', () => {
    it('should schedule the cron job to run annually on January 1st at midnight (0 0 1 1 *)', () => {
      startDividendDistributionJob();

      expect(cron.schedule).toHaveBeenCalledWith('0 0 1 1 *', expect.any(Function));
    });
  });

  describe('executeAnnualDividendDistribution', () => {
    it('should return 0 distributed when no approved reports are found', async () => {
      revenueModel.findApprovedUndistributed.mockResolvedValue([]);

      const result = await executeAnnualDividendDistribution();

      expect(revenueModel.findApprovedUndistributed).toHaveBeenCalledTimes(1);
      expect(distributionService.distributeProfit).not.toHaveBeenCalled();
      expect(result).toEqual({ totalDistributed: 0, reportsCount: 0 });
    });

    it('should distribute profits for each approved annual report', async () => {
      const mockReports = [
        { id: 'report-1', merchant_id: 'merchant-1', merchant: { business_name: 'Cafe A' } },
        { id: 'report-2', merchant_id: 'merchant-2', merchant: { business_name: 'Store B' } },
      ];
      revenueModel.findApprovedUndistributed.mockResolvedValue(mockReports);
      distributionService.distributeProfit.mockResolvedValue({ id: 'dist-1' });

      const result = await executeAnnualDividendDistribution();

      expect(distributionService.distributeProfit).toHaveBeenCalledTimes(2);
      expect(distributionService.distributeProfit).toHaveBeenCalledWith('report-1', null);
      expect(distributionService.distributeProfit).toHaveBeenCalledWith('report-2', null);
      expect(result).toEqual({ totalDistributed: 2, reportsCount: 2 });
    });

    it('should continue processing remaining reports if one report distribution fails', async () => {
      const mockReports = [
        { id: 'report-fail', merchant_id: 'm-1' },
        { id: 'report-success', merchant_id: 'm-2' },
      ];
      revenueModel.findApprovedUndistributed.mockResolvedValue(mockReports);
      distributionService.distributeProfit
        .mockRejectedValueOnce(new Error('Distribution failure'))
        .mockResolvedValueOnce({ id: 'dist-2' });

      const result = await executeAnnualDividendDistribution();

      expect(distributionService.distributeProfit).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ totalDistributed: 1, reportsCount: 2 });
    });
  });
});
