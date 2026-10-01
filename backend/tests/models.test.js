jest.mock('../src/config/prisma', () => ({
  merchant: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  student: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  investment: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
}));

const prisma = require('../src/config/prisma');
const merchantModel = require('../src/models/merchant.model');
const studentModel = require('../src/models/student.model');
const investmentModel = require('../src/models/investment.model');

describe('Backend Models with Prisma', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('MerchantModel', () => {
    it('should create a new merchant via prisma.merchant.create', async () => {
      const mockMerchant = {
        id: 'merchant-uuid-1',
        email: 'store@example.com',
        business_name: 'Bookstore',
      };
      prisma.merchant.create.mockResolvedValue(mockMerchant);

      const result = await merchantModel.create({
        email: 'store@example.com',
        business_name: 'Bookstore',
      });

      expect(prisma.merchant.create).toHaveBeenCalledWith({
        data: { email: 'store@example.com', business_name: 'Bookstore' },
      });
      expect(result).toEqual(mockMerchant);
    });

    it('should find merchant by email in lowercase', async () => {
      const mockMerchant = { id: 'm-1', email: 'store@example.com' };
      prisma.merchant.findUnique.mockResolvedValue(mockMerchant);

      const result = await merchantModel.findByEmail('STORE@EXAMPLE.COM');

      expect(prisma.merchant.findUnique).toHaveBeenCalledWith({
        where: { email: 'store@example.com' },
      });
      expect(result).toEqual(mockMerchant);
    });

    it('should update merchant by id', async () => {
      const mockMerchant = { id: 'm-1', business_name: 'New Name' };
      prisma.merchant.update.mockResolvedValue(mockMerchant);

      const result = await merchantModel.update('m-1', { business_name: 'New Name' });

      expect(prisma.merchant.update).toHaveBeenCalledWith({
        where: { id: 'm-1' },
        data: { business_name: 'New Name' },
      });
      expect(result).toEqual(mockMerchant);
    });
  });

  describe('StudentModel', () => {
    it('should create a new student via prisma.student.create', async () => {
      const mockStudent = { id: 'student-1', email: 'john@uni.edu' };
      prisma.student.create.mockResolvedValue(mockStudent);

      const result = await studentModel.create({ email: 'john@uni.edu' });

      expect(prisma.student.create).toHaveBeenCalledWith({
        data: { email: 'john@uni.edu' },
      });
      expect(result).toEqual(mockStudent);
    });

    it('should find student by student_id', async () => {
      const mockStudent = { id: 'student-1', student_id: 'STU123' };
      prisma.student.findFirst.mockResolvedValue(mockStudent);

      const result = await studentModel.findByStudentId('STU123');

      expect(prisma.student.findFirst).toHaveBeenCalledWith({
        where: { student_id: 'STU123' },
      });
      expect(result).toEqual(mockStudent);
    });
  });

  describe('InvestmentModel', () => {
    it('should create an investment record', async () => {
      const mockInv = { id: 'inv-1', amount: 500, status: 'active' };
      prisma.investment.create.mockResolvedValue(mockInv);

      const result = await investmentModel.create({ amount: 500 });

      expect(prisma.investment.create).toHaveBeenCalledWith({
        data: { amount: 500 },
      });
      expect(result).toEqual(mockInv);
    });

    it('should query investments by studentId', async () => {
      const mockList = [{ id: 'inv-1', student_id: 'stu-1' }];
      prisma.investment.findMany.mockResolvedValue(mockList);

      const result = await investmentModel.findByStudentId('stu-1', 'active');

      expect(prisma.investment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { student_id: 'stu-1', status: 'active' },
        })
      );
      expect(result).toEqual(mockList);
    });
  });
});
