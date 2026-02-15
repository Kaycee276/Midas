import client from './client';
import type { ApiResponse, RevenueReport, RevenueSummary, Pagination } from '../types';

export const submitRevenueReport = (data: {
  gross_revenue: number;
  expenses: number;
  period_start: string;
  period_end: string;
  notes?: string;
}) =>
  client.post<ApiResponse<{ report: RevenueReport }>>('/revenue', data);

export const getRevenueHistory = (params?: { page?: number; limit?: number }) =>
  client.get<ApiResponse<{ reports: RevenueReport[]; pagination: Pagination }>>('/revenue', { params });

export const getRevenueSummary = () =>
  client.get<ApiResponse<RevenueSummary>>('/revenue/summary');
