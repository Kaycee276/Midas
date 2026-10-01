const prisma = require('../config/prisma');

class RevenueModel {
  async create(data) {
    return prisma.revenueReport.create({
      data,
    });
  }

  async findById(id) {
    return prisma.revenueReport.findUnique({
      where: { id },
      include: {
        merchant: {
          select: {
            id: true,
            business_name: true,
            business_type: true,
          },
        },
      },
    });
  }

  async findByMerchantId(merchantId, limit = 20, offset = 0) {
    const [data, count] = await Promise.all([
      prisma.revenueReport.findMany({
        where: { merchant_id: merchantId },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.revenueReport.count({
        where: { merchant_id: merchantId },
      }),
    ]);

    return { data, count };
  }

  async updateStatus(id, status, extras = {}) {
    return prisma.revenueReport.update({
      where: { id },
      data: {
        status,
        ...extras,
        updated_at: new Date(),
      },
    });
  }

  async findPendingReports(limit = 20, offset = 0) {
    const [data, count] = await Promise.all([
      prisma.revenueReport.findMany({
        where: { status: 'pending' },
        include: {
          merchant: {
            select: {
              id: true,
              business_name: true,
              business_type: true,
            },
          },
        },
        orderBy: { submitted_at: 'asc' },
        skip: offset,
        take: limit,
      }),
      prisma.revenueReport.count({
        where: { status: 'pending' },
      }),
    ]);

    return { data, count };
  }

  async findApprovedUndistributed() {
    return prisma.revenueReport.findMany({
      where: { status: 'approved' },
      include: {
        merchant: {
          select: {
            id: true,
            business_name: true,
            business_type: true,
          },
        },
      },
      orderBy: { submitted_at: 'asc' },
    });
  }

  async getPendingDistributionTotal(merchantId) {
    const data = await prisma.revenueReport.findMany({
      where: {
        merchant_id: merchantId,
        status: 'approved',
      },
      select: {
        net_profit: true,
      },
    });

    const total = (data || []).reduce((sum, r) => sum + Number(r.net_profit) * 0.35, 0);
    return Math.round(total * 100) / 100;
  }

  async getRevenueSummary(merchantId) {
    const reports = await prisma.revenueReport.findMany({
      where: { merchant_id: merchantId },
      select: {
        gross_revenue: true,
        net_profit: true,
        status: true,
      },
    });

    const summary = (reports || []).reduce(
      (acc, r) => {
        acc.total_revenue += Number(r.gross_revenue) || 0;
        if (r.status === 'distributed') {
          acc.total_distributed += Number(r.net_profit) || 0;
        }
        if (r.status === 'pending') {
          acc.pending_count += 1;
        }
        return acc;
      },
      { total_revenue: 0, total_distributed: 0, pending_count: 0 }
    );

    return summary;
  }
}

module.exports = new RevenueModel();
