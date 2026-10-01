const prisma = require('../config/prisma');

class MerchantWalletModel {
  async creditBalance(merchantId, amount) {
    const updated = await prisma.merchant.update({
      where: { id: merchantId },
      data: {
        wallet_balance: {
          increment: amount,
        },
      },
      select: { wallet_balance: true },
    });

    return Number(updated.wallet_balance);
  }

  async deductBalance(merchantId, amount) {
    return prisma.$transaction(async (tx) => {
      const merchant = await tx.merchant.findUnique({
        where: { id: merchantId },
        select: { wallet_balance: true },
      });

      if (!merchant) {
        throw new Error('Merchant not found');
      }

      const currentBalance = Number(merchant.wallet_balance) || 0;
      if (currentBalance < Number(amount)) {
        throw new Error('Insufficient merchant wallet balance');
      }

      const updated = await tx.merchant.update({
        where: { id: merchantId },
        data: {
          wallet_balance: {
            decrement: amount,
          },
        },
        select: { wallet_balance: true },
      });

      return Number(updated.wallet_balance);
    });
  }

  async createTransaction(txnData) {
    return prisma.merchantWalletTransaction.create({
      data: txnData,
    });
  }

  async getTransactionHistory(merchantId, limit = 20, offset = 0) {
    const [data, count] = await Promise.all([
      prisma.merchantWalletTransaction.findMany({
        where: { merchant_id: merchantId },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.merchantWalletTransaction.count({
        where: { merchant_id: merchantId },
      }),
    ]);

    return { data, count };
  }
}

module.exports = new MerchantWalletModel();
