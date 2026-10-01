const prisma = require('../config/prisma');

class AdminModel {
  async create(adminData) {
    return prisma.admin.create({
      data: adminData,
    });
  }

  async findById(id) {
    return prisma.admin.findUnique({
      where: { id },
    });
  }

  async findByEmail(email) {
    return prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async getDashboardStats() {
    // Students counts
    const [
      totalStudents,
      activeStudents,
      suspendedStudents,
      inactiveStudents,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.student.count({ where: { account_status: 'active' } }),
      prisma.student.count({ where: { account_status: 'suspended' } }),
      prisma.student.count({ where: { account_status: 'inactive' } }),
    ]);

    // Merchants counts
    const [
      totalMerchants,
      activeMerchants,
      pendingKycMerchants,
      kycSubmittedMerchants,
      kycRejectedMerchants,
      suspendedMerchants,
      inactiveMerchants,
    ] = await Promise.all([
      prisma.merchant.count(),
      prisma.merchant.count({ where: { account_status: 'active' } }),
      prisma.merchant.count({ where: { account_status: 'pending_kyc' } }),
      prisma.merchant.count({ where: { account_status: 'kyc_submitted' } }),
      prisma.merchant.count({ where: { account_status: 'kyc_rejected' } }),
      prisma.merchant.count({ where: { account_status: 'suspended' } }),
      prisma.merchant.count({ where: { account_status: 'inactive' } }),
    ]);

    // Investments counts + financial totals
    const [
      totalInvestments,
      activeInvestments,
      withdrawnInvestments,
      investmentAggregate,
    ] = await Promise.all([
      prisma.investment.count(),
      prisma.investment.count({ where: { status: 'active' } }),
      prisma.investment.count({ where: { status: 'withdrawn' } }),
      prisma.investment.aggregate({
        _sum: {
          amount: true,
          current_value: true,
        },
      }),
    ]);

    const totalInvested = Number(investmentAggregate._sum.amount) || 0;
    const totalCurrentValue = Number(investmentAggregate._sum.current_value) || 0;

    // KYC counts
    const [
      totalKyc,
      pendingKyc,
      approvedKyc,
      rejectedKyc,
      resubmissionKyc,
    ] = await Promise.all([
      prisma.merchantKyc.count(),
      prisma.merchantKyc.count({ where: { status: 'pending' } }),
      prisma.merchantKyc.count({ where: { status: 'approved' } }),
      prisma.merchantKyc.count({ where: { status: 'rejected' } }),
      prisma.merchantKyc.count({ where: { status: 'resubmission_required' } }),
    ]);

    return {
      students: {
        total: totalStudents,
        active: activeStudents,
        suspended: suspendedStudents,
        inactive: inactiveStudents,
      },
      merchants: {
        total: totalMerchants,
        active: activeMerchants,
        pending_kyc: pendingKycMerchants,
        kyc_submitted: kycSubmittedMerchants,
        kyc_rejected: kycRejectedMerchants,
        suspended: suspendedMerchants,
        inactive: inactiveMerchants,
      },
      investments: {
        total: totalInvestments,
        active: activeInvestments,
        withdrawn: withdrawnInvestments,
        total_invested: totalInvested,
        total_current_value: totalCurrentValue,
      },
      kyc: {
        total: totalKyc,
        pending: pendingKyc,
        approved: approvedKyc,
        rejected: rejectedKyc,
        resubmission_required: resubmissionKyc,
      },
    };
  }

  async getAnalytics() {
    // Investment trend - last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentInvestments = await prisma.investment.findMany({
      where: {
        invested_at: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        amount: true,
        invested_at: true,
      },
    });

    const investmentTrend = this._groupByMonth(recentInvestments || [], 'invested_at', 'amount');

    // Revenue trend - last 6 months (distributed reports)
    const distributedReports = await prisma.revenueReport.findMany({
      where: {
        status: 'distributed',
        submitted_at: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        gross_revenue: true,
        net_profit: true,
        submitted_at: true,
        status: true,
      },
    });

    const revenueTrend = this._groupRevenueByMonth(distributedReports || []);

    // Top merchants by capital raised
    const allInvestments = await prisma.investment.findMany({
      select: {
        merchant_id: true,
        amount: true,
        merchant: {
          select: {
            business_name: true,
            business_type: true,
          },
        },
      },
    });

    const merchantTotals = {};
    (allInvestments || []).forEach(inv => {
      const mid = inv.merchant_id;
      if (!merchantTotals[mid]) {
        merchantTotals[mid] = {
          merchant_id: mid,
          business_name: inv.merchant?.business_name || 'Unknown',
          business_type: inv.merchant?.business_type || 'other',
          total_raised: 0,
        };
      }
      merchantTotals[mid].total_raised += Number(inv.amount) || 0;
    });
    const topMerchants = Object.values(merchantTotals)
      .sort((a, b) => b.total_raised - a.total_raised)
      .slice(0, 5);

    // Investments by business type
    const investmentsByType = {};
    (allInvestments || []).forEach(inv => {
      const type = inv.merchant?.business_type || 'other';
      investmentsByType[type] = (investmentsByType[type] || 0) + (Number(inv.amount) || 0);
    });
    const investmentsByTypeArr = Object.entries(investmentsByType).map(([type, amount]) => ({
      business_type: type,
      total_amount: amount,
    }));

    // Recent distributions
    const recentDistributions = await prisma.dividendDistribution.findMany({
      take: 10,
      orderBy: {
        created_at: 'desc',
      },
      include: {
        merchant: {
          select: {
            business_name: true,
            business_type: true,
          },
        },
      },
    });

    // Platform balance
    const platformWallet = await prisma.platformWallet.findFirst({
      select: {
        balance: true,
      },
    });

    // Total platform commission
    const commissionAggregate = await prisma.platformWalletTransaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        type: 'commission',
      },
    });
    const totalCommission = Number(commissionAggregate._sum.amount) || 0;

    // Recent platform transactions
    const platformTransactions = await prisma.platformWalletTransaction.findMany({
      take: 5,
      orderBy: {
        created_at: 'desc',
      },
    });

    // Pending revenue count
    const pendingRevenueCount = await prisma.revenueReport.count({
      where: {
        status: 'pending',
      },
    });

    // Total revenue & distributed
    const allReports = await prisma.revenueReport.findMany({
      select: {
        gross_revenue: true,
        net_profit: true,
        status: true,
      },
    });

    let totalRevenue = 0;
    let totalDistributed = 0;
    (allReports || []).forEach(r => {
      totalRevenue += Number(r.gross_revenue) || 0;
      if (r.status === 'distributed') {
        totalDistributed += Number(r.net_profit) || 0;
      }
    });

    return {
      investment_trend: investmentTrend,
      revenue_trend: revenueTrend,
      top_merchants: topMerchants,
      investments_by_type: investmentsByTypeArr,
      recent_distributions: recentDistributions || [],
      platform_balance: Number(platformWallet?.balance) || 0,
      total_commission: totalCommission,
      platform_transactions: platformTransactions || [],
      pending_revenue_count: pendingRevenueCount || 0,
      total_revenue: totalRevenue,
      total_distributed: totalDistributed,
    };
  }

  _groupByMonth(items, dateField, amountField) {
    const months = {};
    const now = new Date();
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[key] = { month: key, count: 0, total_amount: 0 };
    }
    items.forEach(item => {
      const d = new Date(item[dateField]);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (months[key]) {
        months[key].count += 1;
        months[key].total_amount += Number(item[amountField]) || 0;
      }
    });
    return Object.values(months);
  }

  _groupRevenueByMonth(reports) {
    const months = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[key] = { month: key, total_revenue: 0, total_distributed: 0 };
    }
    reports.forEach(r => {
      const d = new Date(r.submitted_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (months[key]) {
        months[key].total_revenue += Number(r.gross_revenue) || 0;
        months[key].total_distributed += Number(r.net_profit) || 0;
      }
    });
    return Object.values(months);
  }

  async updateLastLogin(id) {
    return prisma.admin.update({
      where: { id },
      data: { last_login: new Date() },
    });
  }
}

module.exports = new AdminModel();
