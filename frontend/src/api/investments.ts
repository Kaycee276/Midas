import client from './client';
import type { ApiResponse, Investment, Transaction, PortfolioSummary, MerchantInvestmentSummary, Pagination } from '../types';

export const createInvestment = (data: { merchant_id: string; amount: number; notes?: string }) =>
  client.post<ApiResponse<{ investment: Investment }>>('/investments', data);

export const getPortfolio = () =>
  client.get<ApiResponse<{ summary: PortfolioSummary; investments: Investment[] }>>('/investments/portfolio');

export const getInvestmentDetail = (id: string) =>
  client.get<ApiResponse<{ investment: Investment }>>(`/investments/${id}`);

export const getInvestmentHistory = (params?: { page?: number; limit?: number }) =>
  client.get<ApiResponse<{ transactions: Transaction[]; pagination: Pagination }>>('/investments/history', { params });

export const withdrawInvestment = (id: string) =>
  client.post<ApiResponse<{ investment: Investment }>>(`/investments/${id}/withdraw`);

export const getMerchantInvestments = (merchantId: string, params?: { page?: number; limit?: number }) =>
  client.get<ApiResponse<{ summary: MerchantInvestmentSummary; investments: Investment[]; pagination: Pagination }>>(`/investments/merchants/${merchantId}`, { params });
