const prisma = require('../config/prisma');
const { NotFoundError } = require('../utils/errors');
const { ACCOUNT_STATUS } = require('../types/enums');

class PublicService {
  async getActiveMerchants(page = 1, limit = 20, filters = {}) {
    const offset = (page - 1) * limit;

    const where = {
      account_status: ACCOUNT_STATUS.ACTIVE,
    };

    if (filters.business_type) {
      where.business_type = filters.business_type;
    }

    if (filters.proximity_to_campus) {
      where.proximity_to_campus = filters.proximity_to_campus;
    }

    if (filters.search) {
      where.OR = [
        { business_name: { contains: filters.search, mode: 'insensitive' } },
        { business_description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [merchants, total] = await Promise.all([
      prisma.merchant.findMany({
        where,
        select: {
          id: true,
          business_name: true,
          business_type: true,
          business_description: true,
          business_address: true,
          business_phone: true,
          proximity_to_campus: true,
          created_at: true,
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.merchant.count({ where }),
    ]);

    return {
      merchants,
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async getMerchantDetails(merchantId) {
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
      select: {
        id: true,
        business_name: true,
        business_type: true,
        business_description: true,
        business_address: true,
        business_phone: true,
        proximity_to_campus: true,
        account_status: true,
        created_at: true,
      },
    });

    if (!merchant) {
      throw new NotFoundError('Merchant not found');
    }

    if (merchant.account_status !== ACCOUNT_STATUS.ACTIVE) {
      throw new NotFoundError('Merchant not available');
    }

    return merchant;
  }

  async getBusinessTypes() {
    const merchants = await prisma.merchant.findMany({
      where: { account_status: ACCOUNT_STATUS.ACTIVE },
      select: { business_type: true },
      distinct: ['business_type'],
    });

    return merchants.map((m) => m.business_type);
  }
}

module.exports = new PublicService();
