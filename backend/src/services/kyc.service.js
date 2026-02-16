const kycModel = require('../models/kyc.model');
const merchantModel = require('../models/merchant.model');
const storageService = require('./storage.service');
const { NotFoundError, ValidationError, ConflictError } = require('../utils/errors');
const { KYC_STATUS, ACCOUNT_STATUS } = require('../types/enums');
const { DOCUMENT_TYPE } = require('../types/enums');

class KycService {
  async submitKyc(merchantId, kycData, files) {
    try {
      const merchant = await merchantModel.findById(merchantId);
      if (!merchant) {
        throw new NotFoundError('Merchant not found');
      }

      const existingKyc = await kycModel.findByMerchantId(merchantId);
      if (existingKyc && existingKyc.status === KYC_STATUS.PENDING) {
        throw new ConflictError('KYC submission already pending review');
      }

      if (existingKyc && existingKyc.status === KYC_STATUS.APPROVED) {
        throw new ConflictError('KYC already approved');
      }

      // Validate required documents
      const requiredDocuments = [
        'national_id_document',
        'business_registration_document',
        'proof_of_address_document',
        'business_photo',
      ];
      const missingDocs = requiredDocuments.filter(
        (doc) => !files?.[doc] || files[doc].length === 0
      );
      if (missingDocs.length > 0) {
        const labels = missingDocs.map((d) => d.replace(/_/g, ' '));
        throw new ValidationError(`Missing required documents: ${labels.join(', ')}`);
      }

      const documentUrls = {};

      // Upload files to Supabase Storage
      if (files) {
        const uploadPromises = [];

        for (const [fieldName, fileArray] of Object.entries(files)) {
          if (fileArray && fileArray.length > 0) {
            const file = fileArray[0];
            uploadPromises.push(
              storageService.uploadFile(file, merchantId, fieldName)
                .then(path => {
                  documentUrls[`${fieldName}_url`] = path;
                })
            );
          }
        }

        await Promise.all(uploadPromises);
      }

      // Prepare KYC data
      const kycSubmission = {
        student_id_number: kycData.student_id_number,
        national_id_number: kycData.national_id_number,
        business_registration_number: kycData.business_registration_number,
        tax_identification_number: kycData.tax_identification_number,
        years_in_operation: kycData.years_in_operation,
        average_monthly_revenue: kycData.average_monthly_revenue,
        ...documentUrls,
        status: KYC_STATUS.PENDING
      };

      let kycRecord;
      if (existingKyc) {
        // Update existing KYC
        kycRecord = await kycModel.update(merchantId, kycSubmission);
      } else {
        // Create new KYC
        kycRecord = await kycModel.create(merchantId, kycSubmission);
      }

      // Update merchant status
      await merchantModel.update(merchantId, {
        kyc_status: KYC_STATUS.PENDING,
        account_status: ACCOUNT_STATUS.KYC_SUBMITTED
      });

      // Create history entry
      await kycModel.createHistoryEntry(merchantId, kycRecord);

      return kycRecord;
    } catch (error) {
      throw error;
    }
  }

  async getKycStatus(merchantId) {
    const kyc = await kycModel.findByMerchantId(merchantId);
    if (!kyc) {
      return {
        status: KYC_STATUS.NOT_STARTED,
        message: 'KYC not yet submitted'
      };
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
        signedUrls[field] = await storageService.getSignedUrl(kyc[field]);
      }
    }

    return {
      ...kyc,
      documents: signedUrls
    };
  }

  async deleteDocument(merchantId, documentType) {
    const kyc = await kycModel.findByMerchantId(merchantId);
    if (!kyc) {
      throw new NotFoundError('KYC record not found');
    }

    if (kyc.status === KYC_STATUS.PENDING) {
      throw new ValidationError('Cannot delete documents while KYC is pending review');
    }

    if (kyc.status === KYC_STATUS.APPROVED) {
      throw new ValidationError('Cannot delete documents after KYC approval');
    }

    const documentField = `${documentType}_url`;
    const documentPath = kyc[documentField];

    if (!documentPath) {
      throw new NotFoundError('Document not found');
    }

    await storageService.deleteFile(documentPath);

    await kycModel.update(merchantId, {
      [documentField]: null
    });

    return { message: 'Document deleted successfully' };
  }

  async getDocument(merchantId, documentType) {
    const kyc = await kycModel.findByMerchantId(merchantId);
    if (!kyc) {
      throw new NotFoundError('KYC record not found');
    }

    const documentField = `${documentType}_url`;
    const documentPath = kyc[documentField];

    if (!documentPath) {
      throw new NotFoundError('Document not found');
    }

    const signedUrl = await storageService.getSignedUrl(documentPath);
    return { url: signedUrl };
  }
}

module.exports = new KycService();
