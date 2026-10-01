const prisma = require('../config/prisma');

class MerchantModel {
  async create(merchantData) {
    return prisma.merchant.create({
      data: merchantData,
    });
  }

  async findById(id) {
    return prisma.merchant.findUnique({
      where: { id },
    });
  }

  async findByEmail(email) {
    return prisma.merchant.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async update(id, updates) {
    return prisma.merchant.update({
      where: { id },
      data: updates,
    });
  }

  async updateLastLogin(id) {
    return prisma.merchant.update({
      where: { id },
      data: { last_login: new Date() },
    });
  }
}

module.exports = new MerchantModel();
