const {
  studentRegistrationSchema,
  studentLoginSchema,
  studentUpdateSchema,
} = require('../src/validators/student.validator');
const {
  merchantRegistrationSchema,
  merchantLoginSchema,
  merchantUpdateSchema,
} = require('../src/validators/merchant.validator');
const {
  createInvestmentSchema,
  updateInvestmentSchema,
} = require('../src/validators/investment.validator');
const { fundWalletSchema, withdrawSchema } = require('../src/validators/wallet.validator');

describe('Backend Validators', () => {
  describe('Student Validators', () => {
    const validStudent = {
      email: 'student@example.com',
      password: 'Password123!',
      full_name: 'John Doe',
      student_id: 'STU12345',
      phone: '+1234567890',
      university: 'State University',
      program: 'Computer Science',
      year_of_study: 3,
      terms_accepted: true,
    };

    it('should validate a valid student registration payload', () => {
      const { error, value } = studentRegistrationSchema.validate(validStudent);
      expect(error).toBeUndefined();
      expect(value.email).toBe('student@example.com');
    });

    it('should reject invalid password format', () => {
      const { error } = studentRegistrationSchema.validate({
        ...validStudent,
        password: 'weak',
      });
      expect(error).toBeDefined();
    });

    it('should reject missing terms acceptance', () => {
      const { error } = studentRegistrationSchema.validate({
        ...validStudent,
        terms_accepted: false,
      });
      expect(error).toBeDefined();
    });

    it('should validate student login payload', () => {
      const { error } = studentLoginSchema.validate({
        email: 'student@example.com',
        password: 'Password123!',
      });
      expect(error).toBeUndefined();
    });

    it('should validate student update payload with at least one field', () => {
      const { error } = studentUpdateSchema.validate({
        full_name: 'Jane Doe',
      });
      expect(error).toBeUndefined();
    });

    it('should reject empty student update payload', () => {
      const { error } = studentUpdateSchema.validate({});
      expect(error).toBeDefined();
    });
  });

  describe('Merchant Validators', () => {
    const validMerchant = {
      email: 'merchant@store.com',
      password: 'Password123!',
      business_name: 'Campus Cafe',
      business_type: 'restaurant',
      business_description: 'Best coffee and bakery around campus',
      business_address: '123 University Blvd, Suite 400',
      business_phone: '+1234567890',
      owner_full_name: 'Alice Smith',
      owner_phone: '+1234567890',
      owner_email: 'owner@store.com',
      proximity_to_campus: 'on_campus',
      terms_accepted: true,
    };

    it('should validate a valid merchant registration payload', () => {
      const { error, value } = merchantRegistrationSchema.validate(validMerchant);
      expect(error).toBeUndefined();
      expect(value.email).toBe('merchant@store.com');
    });

    it('should reject invalid business type', () => {
      const { error } = merchantRegistrationSchema.validate({
        ...validMerchant,
        business_type: 'invalid_type_here',
      });
      expect(error).toBeDefined();
    });

    it('should validate merchant login payload', () => {
      const { error } = merchantLoginSchema.validate({
        email: 'merchant@store.com',
        password: 'Password123!',
      });
      expect(error).toBeUndefined();
    });

    it('should validate merchant update payload', () => {
      const { error } = merchantUpdateSchema.validate({
        business_name: 'Updated Cafe',
      });
      expect(error).toBeUndefined();
    });
  });

  describe('Investment Validators', () => {
    it('should validate investment creation with valid uuid and amount', () => {
      const { error } = createInvestmentSchema.validate({
        merchant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        amount: 500,
        notes: 'Seed investment',
      });
      expect(error).toBeUndefined();
    });

    it('should reject amount below minimum ($10)', () => {
      const { error } = createInvestmentSchema.validate({
        merchant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        amount: 5,
      });
      expect(error).toBeDefined();
    });

    it('should validate investment update with current_value', () => {
      const { error } = updateInvestmentSchema.validate({
        current_value: 600,
        return_amount: 100,
      });
      expect(error).toBeUndefined();
    });
  });

  describe('Wallet Validators', () => {
    it('should validate funding wallet with valid amount', () => {
      const { error } = fundWalletSchema.validate({ amount: 5000 });
      expect(error).toBeUndefined();
    });

    it('should reject funding with amount below minimum (100)', () => {
      const { error } = fundWalletSchema.validate({ amount: 50 });
      expect(error).toBeDefined();
    });

    it('should validate withdrawal with valid amount', () => {
      const { error } = withdrawSchema.validate({ amount: 1000 });
      expect(error).toBeUndefined();
    });

    it('should reject withdrawal with amount above max (10,000,000)', () => {
      const { error } = withdrawSchema.validate({ amount: 15000000 });
      expect(error).toBeDefined();
    });
  });
});
