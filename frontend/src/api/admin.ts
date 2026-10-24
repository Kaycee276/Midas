import client from './client';
import type {
  ApiResponse,
  Admin,
  KYC,
  Pagination,
  LoginData,
  DashboardStats,
  RevenueReport,
  AdminAnalytics,
  PlatformWalletInfo,
  DividendDistribution,
} from '../types';

export const adminLogin = (data: LoginData) =>
  client.post<ApiResponse<{ admin: Admin; token: string }>>('/admin/login', data);

export const getDashboardStats = (options?: { bypassCache?: boolean }) =>
  client.get<ApiResponse<DashboardStats>>('/admin/dashboard/stats', options);

export const getPendingKYC = (
  params?: { page?: number; limit?: number },
  options?: { bypassCache?: boolean }
) =>
  client.get<ApiResponse<{ kyc_submissions: KYC[]; pagination: Pagination }>>(
    '/admin/kyc/pending',
    { params, ...options }
  );

export const getKYCDetail = (id: string, options?: { bypassCache?: boolean }) =>
  client.get<ApiResponse<{ kyc: KYC }>>(`/admin/kyc/${id}`, options);

export const approveKYC = (id: string, admin_notes?: string) =>
  client.post<ApiResponse<{ kyc: KYC }>>(`/admin/kyc/${id}/approve`, { admin_notes });

export const rejectKYC = (
  id: string,
  data: {
    status: 'rejected' | 'resubmission_required';
    rejection_reason: string;
    admin_notes?: string;
  }
) => client.post<ApiResponse<{ kyc: KYC }>>(`/admin/kyc/${id}/reject`, data);

// Revenue management
export const getPendingRevenue = (
  params?: { page?: number; limit?: number },
  options?: { bypassCache?: boolean }
) =>
  client.get<ApiResponse<{ reports: RevenueReport[]; pagination: Pagination }>>(
    '/admin/revenue/pending',
    { params, ...options }
  );

export const approveRevenue = (id: string, admin_notes?: string) =>
  client.post<ApiResponse<{ report: RevenueReport }>>(`/admin/revenue/${id}/approve`, {
    admin_notes,
  });

export const rejectRevenue = (
  id: string,
  data: { rejection_reason: string; admin_notes?: string }
) => client.post<ApiResponse<{ report: RevenueReport }>>(`/admin/revenue/${id}/reject`, data);

export const distributeRevenue = (id: string) =>
  client.post<ApiResponse<{ distribution: DividendDistribution }>>(
    `/admin/revenue/${id}/distribute`
  );

// Platform wallet
export const getPlatformWallet = (options?: { bypassCache?: boolean }) =>
  client.get<ApiResponse<PlatformWalletInfo>>('/admin/platform-wallet', options);

// Analytics
export const getAnalytics = (options?: { bypassCache?: boolean }) =>
  client.get<ApiResponse<AdminAnalytics>>('/admin/analytics', options);
