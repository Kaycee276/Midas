const prisma = require('../config/prisma');

class InvestmentModel {
  async create(investmentData) {
    return prisma.investment.create({
      data: investmentData,
    });
  }

  async findById(id) {
    return prisma.investment.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            full_name: true,
            email: true,
            student_id: true,
          },
        },
        merchant: {
          select: {
            id: true,
            business_name: true,
            business_type: true,
            business_address: true,
          },
        },
      },
    });
  }

  async findByStudentId(studentId, status = null) {
    const where = { student_id: studentId };
    if (status) {
      where.status = status;
    }

    return prisma.investment.findMany({
      where,
      include: {
        merchant: {
          select: {
            id: true,
            business_name: true,
            business_type: true,
            business_address: true,
            proximity_to_campus: true,
          },
        },
      },
      orderBy: {
        invested_at: 'desc',
      },
    });
  }

  async findByMerchantId(merchantId, limit = 20, offset = 0) {
    const [data, count] = await Promise.all([
      prisma.investment.findMany({
        where: { merchant_id: merchantId },
        include: {
          student: {
            select: {
              id: true,
              full_name: true,
              student_id: true,
            },
          },
        },
        orderBy: {
          invested_at: 'desc',
        },
        skip: offset,
        take: limit,
      }),
      prisma.investment.count({
        where: { merchant_id: merchantId },
      }),
    ]);

    return { data, count };
  }

  async getPortfolioSummary(studentId) {
    try {
      const result = await prisma.$queryRaw`
        SELECT * FROM student_portfolio_summary WHERE student_id = ${studentId}::uuid LIMIT 1
      `;
      return result[0] || null;
    } catch {
      // Fallback calculation in case view is not yet created in the DB
      const investments = await prisma.investment.findMany({
        where: { student_id: studentId, status: 'active' },
      });
      const total_invested = investments.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
      const current_value = investments.reduce((sum, inv) => sum + (Number(inv.current_value) || 0), 0);
      const returns_earned = investments.reduce((sum, inv) => sum + (Number(inv.return_amount) || 0), 0);
      return {
        student_id: studentId,
        total_investments: investments.length,
        total_invested,
        current_value,
        returns_earned,
      };
    }
  }

  async getMerchantInvestmentSummary(merchantId) {
    try {
      const result = await prisma.$queryRaw`
        SELECT * FROM merchant_investment_summary WHERE merchant_id = ${merchantId}::uuid LIMIT 1
      `;
      return result[0] || null;
    } catch {
      // Fallback calculation in case view is not yet created in the DB
      const investments = await prisma.investment.findMany({
        where: { merchant_id: merchantId, status: 'active' },
      });
      const total_raised = investments.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
      const uniqueInvestors = new Set(investments.map(i => i.student_id)).size;
      return {
        merchant_id: merchantId,
        total_raised,
        total_investors: uniqueInvestors,
        active_investments: investments.length,
      };
    }
  }

  async update(id, updates) {
    return prisma.investment.update({
      where: { id },
      data: updates,
    });
  }

  async getTotalInvestedByStudent(studentId) {
    const aggregate = await prisma.investment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        student_id: studentId,
        status: 'active',
      },
    });

    return Number(aggregate._sum.amount) || 0;
  }

  async getTransactionHistory(studentId, limit = 50, offset = 0) {
    const [data, count] = await Promise.all([
      prisma.investmentTransaction.findMany({
        where: { student_id: studentId },
        include: {
          merchant: {
            select: {
              business_name: true,
              business_type: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        skip: offset,
        take: limit,
      }),
      prisma.investmentTransaction.count({
        where: { student_id: studentId },
      }),
    ]);

    return { data, count };
  }
}

module.exports = new InvestmentModel();
