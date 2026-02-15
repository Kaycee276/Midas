const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const adminModel = require('../models/admin.model');
const kycModel = require('../models/kyc.model');
const merchantModel = require('../models/merchant.model');
const storageService = require('./storage.service');
const { AuthenticationError, NotFoundError, ValidationError } = require('../utils/errors');
const { KYC_STATUS, ACCOUNT_STATUS } = require('../types/enums');

class AdminService {
  async login(email, password) {
    const admin = await adminModel.findByEmail(email);
    if (!admin) {
      throw new AuthenticationError('Invalid email or password');
    }

    if (!admin.is_active) {
      throw new AuthenticationError('Account is inactive');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    await adminModel.updateLastLogin(admin.id);

    const token = this.generateToken(admin.id, 'admin');

    const { password_hash, ...adminWithoutPassword } = admin;

    return {
      admin: adminWithoutPassword,
      token
    };
  }

  async getDashboardStats() {
    return await adminModel.getDashboardStats();
  }

  async getPendingKyc(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { data, count } = await kycModel.findPendingKyc(limit, offset);

    return {
      kyc_submissions: data,
      pagination: {
        total: count,
        page,
        limit,
        total_pages: Math.ceil(count / limit)
      }
    };
  }

  async getKycDetails(kycId) {
    const kyc = await kycModel.findById(kycId);
    if (!kyc) {
      throw new NotFoundError('KYC submission not found');
    }

    // Generate signed URLs for documents
    const signedUrls = {};
    const documentFields = [
      'student_id_document_url',
      'national_id_document_url',
      'business_registration_document_url',
      'proof_of_address_document_url',
      'business_photo_url'
    ];

    for (const field of documentFields) {
      if (kyc[field]) {
        signedUrls[field] = await storageService.getSignedUrl(kyc[field], 7200); // 2 hour expiry
      }
    }

    return {
      ...kyc,
      documents: signedUrls
    };
  }

  async approveKyc(kycId, adminId, notes) {
    const kyc = await kycModel.findById(kycId);
    if (!kyc) {
      throw new NotFoundError('KYC submission not found');
    }

    if (kyc.status === KYC_STATUS.APPROVED) {
      throw new ValidationError('KYC already approved');
    }

    const updatedKyc = await kycModel.updateStatus(kycId, KYC_STATUS.APPROVED, {
      reviewed_by: adminId,
      admin_notes: notes
    });

    // Update merchant status to active
    await merchantModel.update(kyc.merchant_id, {
      kyc_status: KYC_STATUS.APPROVED,
      account_status: ACCOUNT_STATUS.ACTIVE
    });

    // Create history entry
    await kycModel.createHistoryEntry(kyc.merchant_id, updatedKyc);

    return updatedKyc;
  }

  async rejectKyc(kycId, adminId, reason, notes) {
    const kyc = await kycModel.findById(kycId);
    if (!kyc) {
      throw new NotFoundError('KYC submission not found');
    }

    if (kyc.status === KYC_STATUS.APPROVED) {
      throw new ValidationError('Cannot reject approved KYC');
    }

    const updatedKyc = await kycModel.updateStatus(kycId, KYC_STATUS.REJECTED, {
      reviewed_by: adminId,
      rejection_reason: reason,
      admin_notes: notes
    });

    // Update merchant status
    await merchantModel.update(kyc.merchant_id, {
      kyc_status: KYC_STATUS.REJECTED,
      account_status: ACCOUNT_STATUS.KYC_REJECTED
    });

    // Create history entry
    await kycModel.createHistoryEntry(kyc.merchant_id, updatedKyc);

    return updatedKyc;
  }

  async requestResubmission(kycId, adminId, reason, notes) {
    const kyc = await kycModel.findById(kycId);
    if (!kyc) {
      throw new NotFoundError('KYC submission not found');
    }

    const updatedKyc = await kycModel.updateStatus(kycId, KYC_STATUS.RESUBMISSION_REQUIRED, {
      reviewed_by: adminId,
      rejection_reason: reason,
      admin_notes: notes
    });

    // Update merchant status
    await merchantModel.update(kyc.merchant_id, {
      kyc_status: KYC_STATUS.RESUBMISSION_REQUIRED,
      account_status: ACCOUNT_STATUS.PENDING_KYC
    });

    // Create history entry
    await kycModel.createHistoryEntry(kyc.merchant_id, updatedKyc);

    return updatedKyc;
  }

  generateToken(userId, type) {
    return jwt.sign(
      { id: userId, type },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }
}

module.exports = new AdminService();
