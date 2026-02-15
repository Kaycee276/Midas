import client from './client';
import type { ApiResponse, Admin, KYC, Pagination, LoginData, DashboardStats } from '../types';

export const adminLogin = (data: LoginData) =>
  client.post<ApiResponse<{ admin: Admin; token: string }>>('/admin/login', data);

export const getDashboardStats = () =>
  client.get<ApiResponse<DashboardStats>>('/admin/dashboard/stats');

export const getPendingKYC = (params?: { page?: number; limit?: number }) =>
  client.get<ApiResponse<{ kyc_submissions: KYC[]; pagination: Pagination }>>('/admin/kyc/pending', { params });

export const getKYCDetail = (id: string) =>
  client.get<ApiResponse<{ kyc: KYC }>>(`/admin/kyc/${id}`);

export const approveKYC = (id: string, admin_notes?: string) =>
  client.post<ApiResponse<{ kyc: KYC }>>(`/admin/kyc/${id}/approve`, { admin_notes });

export const rejectKYC = (id: string, data: { status: 'rejected' | 'resubmission_required'; rejection_reason: string; admin_notes?: string }) =>
  client.post<ApiResponse<{ kyc: KYC }>>(`/admin/kyc/${id}/reject`, data);
