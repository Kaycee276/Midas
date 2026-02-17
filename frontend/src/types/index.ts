export interface Merchant {
  id: string;
  email: string;
  business_name: string;
  business_type: BusinessType;
  business_description: string;
  business_address: string;
  business_phone: string;
  owner_full_name: string;
  owner_phone: string;
  owner_email?: string;
  proximity_to_campus: ProximityType;
  account_status: MerchantAccountStatus;
  kyc_status: KYCStatus;
  created_at: string;
  updated_at: string;
  last_login?: string;
  terms_accepted: boolean;
  terms_accepted_at?: string;
}

export interface Student {
  id: string;
  email: string;
  full_name: string;
  student_id?: string;
  phone?: string;
  university?: string;
  program?: string;
  year_of_study?: number;
  wallet_balance: number;
  account_status: 'active' | 'suspended' | 'inactive';
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  terms_accepted: boolean;
  terms_accepted_at?: string;
}

export interface Admin {
  id: string;
  email: string;
  full_name: string;
  role: 'reviewer' | 'super_admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface KYC {
  id: string;
  merchant_id: string;
  student_id_number?: string;
  national_id_number?: string;
  business_registration_number?: string;
  tax_identification_number?: string;
  student_id_document_url?: string;
  national_id_document_url?: string;
  business_registration_document_url?: string;
  proof_of_address_document_url?: string;
  business_photo_url?: string;
  years_in_operation?: number;
  average_monthly_revenue?: number;
  status: KYCStatus;
  submitted_at?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  merchant?: Merchant;
}

export interface Investment {
  id: string;
  student_id: string;
  merchant_id: string;
  amount: number;
  shares: number;
  price_per_share: number;
  status: InvestmentStatus;
  invested_at: string;
  current_value: number;
  return_amount: number;
  return_percentage: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  student?: Student;
  merchant?: Merchant;
}

export interface Transaction {
  id: string;
  investment_id: string;
  student_id: string;
  merchant_id: string;
  transaction_type: TransactionType;
  amount: number;
  shares: number;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
  merchant?: { business_name: string; business_type: string };
}

export interface PortfolioSummary {
  total_investments: number;
  total_invested: number;
  current_portfolio_value: number;
  total_returns: number;
  average_return_percentage: number;
  active_investments: number;
}

export interface MerchantInvestmentSummary {
  total_investors: number;
  total_investments: number;
  total_capital_raised: number;
  total_shares_issued: number;
  active_investments: number;
}

export interface DashboardStats {
  students: { total: number; active: number; suspended: number; inactive: number };
  merchants: { total: number; active: number; pending_kyc: number; kyc_submitted: number; kyc_rejected: number; suspended: number; inactive: number };
  investments: { total: number; active: number; withdrawn: number; total_invested: number; total_current_value: number };
  kyc: { total: number; pending: number; approved: number; rejected: number; resubmission_required: number };
}

// Revenue & Distribution types
export type RevenueReportStatus = 'pending' | 'approved' | 'rejected' | 'distributed';

export interface RevenueReport {
  id: string;
  merchant_id: string;
  period_start: string;
  period_end: string;
  gross_revenue: number;
  expenses: number;
  net_profit: number;
  status: RevenueReportStatus;
  notes?: string;
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  merchant?: { id: string; business_name: string; business_type: string };
}

export interface DividendDistribution {
  id: string;
  revenue_report_id: string;
  merchant_id: string;
  total_profit: number;
  merchant_share: number;
  investor_share_pool: number;
  platform_share: number;
  status: 'pending' | 'completed' | 'failed';
  distributed_at?: string;
  created_at: string;
  merchant?: { business_name: string; business_type: string };
}

export interface DividendPayout {
  id: string;
  distribution_id: string;
  investment_id: string;
  student_id: string;
  merchant_id: string;
  amount: number;
  shares_held: number;
  total_shares: number;
  status: 'pending' | 'completed';
  created_at: string;
}

export interface RevenueSummary {
  total_revenue: number;
  total_distributed: number;
  pending_count: number;
}

export interface InvestmentTrend {
  month: string;
  count: number;
  total_amount: number;
}

export interface RevenueTrend {
  month: string;
  total_revenue: number;
  total_distributed: number;
}

export interface TopMerchant {
  merchant_id: string;
  business_name: string;
  business_type: string;
  total_raised: number;
}

export interface InvestmentByType {
  business_type: string;
  total_amount: number;
}

export interface AdminAnalytics {
  investment_trend: InvestmentTrend[];
  revenue_trend: RevenueTrend[];
  top_merchants: TopMerchant[];
  investments_by_type: InvestmentByType[];
  recent_distributions: DividendDistribution[];
  platform_balance: number;
  total_commission: number;
  platform_transactions: PlatformWalletTransaction[];
  pending_revenue_count: number;
  total_revenue: number;
  total_distributed: number;
}

export interface PlatformWalletTransaction {
  id: string;
  type: 'commission' | 'withdrawal';
  amount: number;
  balance_before: number;
  balance_after: number;
  reference_id?: string;
  description?: string;
  created_at: string;
}

export interface PlatformWalletInfo {
  balance: number;
  transactions: PlatformWalletTransaction[];
  total_transactions: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  errors?: unknown;
}

export type BusinessType =
  | 'restaurant' | 'cafe' | 'food_truck' | 'retail' | 'bookstore'
  | 'laundry' | 'salon' | 'gym' | 'tutoring' | 'printing'
  | 'electronics' | 'clothing' | 'other';

export type ProximityType =
  | 'on_campus' | 'within_1km' | 'within_2km' | 'within_5km' | 'more_than_5km';

export type MerchantAccountStatus =
  | 'pending_kyc' | 'kyc_submitted' | 'kyc_rejected' | 'active' | 'suspended' | 'inactive';

export type KYCStatus =
  | 'not_started' | 'pending' | 'approved' | 'rejected' | 'resubmission_required';

export type InvestmentStatus = 'active' | 'withdrawn' | 'matured' | 'cancelled';

export type TransactionType = 'investment' | 'dividend' | 'withdrawal' | 'return';

export type UserRole = 'merchant' | 'student' | 'admin';

export interface AuthUser {
  id: string;
  role: UserRole;
  data: Merchant | Student | Admin;
}

export interface MerchantRegisterData {
  email: string;
  password: string;
  business_name: string;
  business_type: BusinessType;
  business_description: string;
  business_address: string;
  business_phone: string;
  owner_full_name: string;
  owner_phone: string;
  owner_email?: string;
  proximity_to_campus: ProximityType;
  terms_accepted: boolean;
}

export interface StudentRegisterData {
  email: string;
  password: string;
  full_name: string;
  student_id?: string;
  phone?: string;
  university?: string;
  program?: string;
  year_of_study?: number;
  terms_accepted: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

// Wallet types
export type WalletTransactionType = 'deposit' | 'withdrawal' | 'investment_debit' | 'investment_refund' | 'dividend_credit';
export type WalletTransactionStatus = 'pending' | 'completed' | 'failed' | 'reversed';

export interface WalletTransaction {
  id: string;
  student_id: string;
  type: WalletTransactionType;
  amount: number;
  balance_before: number;
  balance_after: number;
  payment_reference?: string;
  status: WalletTransactionStatus;
  investment_id?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface WalletInfo {
  balance: number;
  recent_transactions: WalletTransaction[];
}

// Merchant Wallet types
export type MerchantWalletTransactionType = 'investment_credit' | 'withdrawal' | 'dividend_debit';

export interface MerchantWalletTransaction {
  id: string;
  merchant_id: string;
  type: MerchantWalletTransactionType;
  amount: number;
  balance_before: number;
  balance_after: number;
  payment_reference?: string;
  status: WalletTransactionStatus;
  investment_id?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface MerchantWalletInfo {
  balance: number;
  recent_transactions: MerchantWalletTransaction[];
}

