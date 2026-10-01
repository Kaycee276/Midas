const prisma = require('../config/prisma');

class DistributionModel {
  async create(data) {
    return prisma.dividendDistribution.create({
      data,
    });
  }

  async createPayout(data) {
    return prisma.dividendPayout.create({
      data,
    });
  }

  async updateStatus(id, status, extras = {}) {
    return prisma.dividendDistribution.update({
      where: { id },
      data: {
        status,
        ...extras,
      },
    });
  }

  async findByRevenueReportId(reportId) {
    return prisma.dividendDistribution.findFirst({
      where: { revenue_report_id: reportId },
    });
  }

  async getRecentDistributions(limit = 10, offset = 0) {
    const [data, count] = await Promise.all([
      prisma.dividendDistribution.findMany({
        include: {
          merchant: {
            select: {
              id: true,
              business_name: true,
              business_type: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.dividendDistribution.count(),
    ]);

    return { data, count };
  }
}

module.exports = new DistributionModel();
