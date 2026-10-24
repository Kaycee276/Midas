import client from './client';
import type {
  ApiResponse,
  Investment,
  Transaction,
  PortfolioSummary,
  MerchantInvestmentSummary,
  Pagination,
  StudentRoiData,
} from '../types';

export const createInvestment = (data: { merchant_id: string; amount: number; notes?: string }) =>
  client.post<ApiResponse<{ investment: Investment }>>('/investments', data);

export const getPortfolio = (options?: { bypassCache?: boolean }) =>
  client.get<ApiResponse<{ summary: PortfolioSummary; investments: Investment[] }>>(
    '/investments/portfolio',
    options
  );

export const getStudentRoi = (options?: { bypassCache?: boolean }) =>
  client.get<ApiResponse<StudentRoiData>>('/investments/roi', options);

export const getInvestmentDetail = (id: string, options?: { bypassCache?: boolean }) =>
  client.get<ApiResponse<{ investment: Investment }>>(`/investments/${id}`, options);

export const getInvestmentHistory = (
  params?: { page?: number; limit?: number },
  options?: { bypassCache?: boolean }
) =>
  client.get<ApiResponse<{ transactions: Transaction[]; pagination: Pagination }>>(
    '/investments/history',
    { params, ...options }
  );

export const withdrawInvestment = (id: string) =>
  client.post<ApiResponse<{ investment: Investment }>>(`/investments/${id}/withdraw`);

export const getMerchantInvestments = (
  merchantId: string,
  params?: { page?: number; limit?: number },
  options?: { bypassCache?: boolean }
) =>
  client.get<
    ApiResponse<{
      summary: MerchantInvestmentSummary;
      investments: Investment[];
      pagination: Pagination;
    }>
  >(`/investments/merchants/${merchantId}`, { params, ...options });
