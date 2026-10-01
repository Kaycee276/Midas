const prisma = require('../config/prisma');

class PlatformWalletModel {
  async getBalance() {
    return prisma.platformWallet.findFirst();
  }

  async creditBalance(amount) {
    const wallet = await prisma.platformWallet.findFirst();
    if (wallet) {
      return prisma.platformWallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            increment: amount,
          },
        },
      });
    }

    return prisma.platformWallet.create({
      data: {
        balance: amount,
      },
    });
  }

  async createTransaction(txnData) {
    return prisma.platformWalletTransaction.create({
      data: txnData,
    });
  }

  async getTransactionHistory(limit = 20, offset = 0) {
    const [data, count] = await Promise.all([
      prisma.platformWalletTransaction.findMany({
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.platformWalletTransaction.count(),
    ]);

    return { data, count };
  }
}

module.exports = new PlatformWalletModel();
