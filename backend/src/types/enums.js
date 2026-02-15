const KYC_STATUS = {
  NOT_STARTED: 'not_started',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  RESUBMISSION_REQUIRED: 'resubmission_required'
};

const ACCOUNT_STATUS = {
  PENDING_KYC: 'pending_kyc',
  KYC_SUBMITTED: 'kyc_submitted',
  KYC_REJECTED: 'kyc_rejected',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  INACTIVE: 'inactive'
};

const ADMIN_ROLE = {
  REVIEWER: 'reviewer',
  SUPER_ADMIN: 'super_admin'
};

const DOCUMENT_TYPE = {
  STUDENT_ID: 'student_id_document',
  NATIONAL_ID: 'national_id_document',
  BUSINESS_REGISTRATION: 'business_registration_document',
  PROOF_OF_ADDRESS: 'proof_of_address_document',
  BUSINESS_PHOTO: 'business_photo'
};

const INVESTMENT_STATUS = {
  ACTIVE: 'active',
  WITHDRAWN: 'withdrawn',
  MATURED: 'matured',
  CANCELLED: 'cancelled'
};

const TRANSACTION_TYPE = {
  INVESTMENT: 'investment',
  DIVIDEND: 'dividend',
  WITHDRAWAL: 'withdrawal',
  RETURN: 'return'
};

module.exports = {
  KYC_STATUS,
  ACCOUNT_STATUS,
  ADMIN_ROLE,
  DOCUMENT_TYPE,
  INVESTMENT_STATUS,
  TRANSACTION_TYPE
};
