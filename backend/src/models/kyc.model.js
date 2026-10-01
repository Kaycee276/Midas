const prisma = require('../config/prisma');

class KycModel {
  async create(merchantId, kycData) {
    return prisma.merchantKyc.create({
      data: {
        merchant_id: merchantId,
        ...kycData,
        submitted_at: new Date(),
      },
    });
  }

  async findByMerchantId(merchantId) {
    return prisma.merchantKyc.findUnique({
      where: { merchant_id: merchantId },
    });
  }

  async findById(id) {
    return prisma.merchantKyc.findUnique({
      where: { id },
      include: {
        merchant: {
          select: {
            id: true,
            email: true,
            business_name: true,
            business_type: true,
            business_address: true,
            business_phone: true,
            owner_full_name: true,
            owner_phone: true,
            created_at: true,
          },
        },
      },
    });
  }

  async update(merchantId, kycData) {
    return prisma.merchantKyc.update({
      where: { merchant_id: merchantId },
      data: kycData,
    });
  }

  async updateStatus(kycId, status, reviewData = {}) {
    return prisma.merchantKyc.update({
      where: { id: kycId },
      data: {
        status,
        reviewed_at: new Date(),
        ...reviewData,
      },
    });
  }

  async createHistoryEntry(merchantId, kycData) {
    return prisma.kycSubmissionHistory.create({
      data: {
        merchant_id: merchantId,
        kyc_data: kycData,
        status: kycData.status,
        rejection_reason: kycData.rejection_reason,
        reviewed_at: kycData.reviewed_at ? new Date(kycData.reviewed_at) : null,
        reviewed_by: kycData.reviewed_by,
      },
    });
  }

  async findPendingKyc(limit = 20, offset = 0) {
    const [data, count] = await Promise.all([
      prisma.merchantKyc.findMany({
        where: { status: 'pending' },
        include: {
          merchant: {
            select: {
              id: true,
              email: true,
              business_name: true,
              business_type: true,
              owner_full_name: true,
              created_at: true,
            },
          },
        },
        orderBy: { submitted_at: 'asc' },
        skip: offset,
        take: limit,
      }),
      prisma.merchantKyc.count({
        where: { status: 'pending' },
      }),
    ]);

    return { data, count };
  }
}

module.exports = new KycModel();
