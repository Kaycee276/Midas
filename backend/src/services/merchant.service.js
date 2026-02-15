const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const merchantModel = require('../models/merchant.model');
const emailService = require('./email.service');
const { ConflictError, AuthenticationError, NotFoundError } = require('../utils/errors');
const { ACCOUNT_STATUS, KYC_STATUS } = require('../types/enums');

class MerchantService {
  async register(merchantData) {
    const existingMerchant = await merchantModel.findByEmail(merchantData.email);
    if (existingMerchant) {
      throw new ConflictError('Email already registered');
    }

    const passwordHash = await bcrypt.hash(merchantData.password, 12);

    const merchant = await merchantModel.create({
      email: merchantData.email.toLowerCase(),
      password_hash: passwordHash,
      business_name: merchantData.business_name,
      business_type: merchantData.business_type,
      business_description: merchantData.business_description,
      business_address: merchantData.business_address,
      business_phone: merchantData.business_phone,
      owner_full_name: merchantData.owner_full_name,
      owner_phone: merchantData.owner_phone,
      owner_email: merchantData.owner_email,
      proximity_to_campus: merchantData.proximity_to_campus,
      account_status: ACCOUNT_STATUS.PENDING_KYC,
      kyc_status: KYC_STATUS.NOT_STARTED,
      is_verified: false,
      terms_accepted: merchantData.terms_accepted,
      terms_accepted_at: new Date().toISOString()
    });

    try {
      const verificationToken = this.generateVerificationToken(merchant.id);
      await emailService.sendVerificationEmail(
        merchant.email,
        merchantData.owner_full_name || merchantData.business_name,
        verificationToken
      );
    } catch (err) {
      console.error('Verification email failed (merchant created):', err.message);
    }

    const { password_hash, ...merchantWithoutPassword } = merchant;

    return {
      merchant: merchantWithoutPassword,
      message: 'Registration successful. Please check your email to verify your account.'
    };
  }

  async login(email, password) {
    const merchant = await merchantModel.findByEmail(email);
    if (!merchant) {
      throw new AuthenticationError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, merchant.password_hash);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    if (merchant.is_verified === false) {
      throw new AuthenticationError('Please verify your email before logging in');
    }

    await merchantModel.updateLastLogin(merchant.id);

    const token = this.generateToken(merchant.id, 'merchant');

    const { password_hash, ...merchantWithoutPassword } = merchant;

    return {
      merchant: merchantWithoutPassword,
      token
    };
  }

  async getProfile(merchantId) {
    const merchant = await merchantModel.findById(merchantId);
    if (!merchant) {
      throw new NotFoundError('Merchant not found');
    }

    const { password_hash, ...merchantWithoutPassword } = merchant;
    return merchantWithoutPassword;
  }

  async updateProfile(merchantId, updates) {
    const merchant = await merchantModel.findById(merchantId);
    if (!merchant) {
      throw new NotFoundError('Merchant not found');
    }

    const updatedMerchant = await merchantModel.update(merchantId, updates);

    const { password_hash, ...merchantWithoutPassword } = updatedMerchant;
    return merchantWithoutPassword;
  }

  generateToken(userId, type) {
    return jwt.sign(
      { id: userId, type },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  generateVerificationToken(userId) {
    return jwt.sign(
      { id: userId, type: 'email_verify', userType: 'merchant' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }
}

module.exports = new MerchantService();
