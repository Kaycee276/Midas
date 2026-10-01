const prisma = require('../config/prisma');

class WalletModel {
  // Atomic balance operations via Prisma transactions
  async deductBalance(studentId, amount) {
    return prisma.$transaction(async (tx) => {
      const student = await tx.student.findUnique({
        where: { id: studentId },
        select: { wallet_balance: true },
      });

      if (!student) {
        throw new Error('Student not found');
      }

      const currentBalance = Number(student.wallet_balance) || 0;
      if (currentBalance < Number(amount)) {
        throw new Error('Insufficient wallet balance');
      }

      const updated = await tx.student.update({
        where: { id: studentId },
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

  async creditBalance(studentId, amount) {
    const updated = await prisma.student.update({
      where: { id: studentId },
      data: {
        wallet_balance: {
          increment: amount,
        },
      },
      select: { wallet_balance: true },
    });

    return Number(updated.wallet_balance);
  }

  // Wallet transactions
  async createTransaction(txnData) {
    return prisma.walletTransaction.create({
      data: txnData,
    });
  }

  async updateTransaction(id, updates) {
    return prisma.walletTransaction.update({
      where: { id },
      data: {
        ...updates,
        updated_at: new Date(),
      },
    });
  }

  async getTransactionHistory(studentId, limit = 20, offset = 0) {
    const [data, count] = await Promise.all([
      prisma.walletTransaction.findMany({
        where: { student_id: studentId },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.walletTransaction.count({
        where: { student_id: studentId },
      }),
    ]);

    return { data, count };
  }
}

module.exports = new WalletModel();
