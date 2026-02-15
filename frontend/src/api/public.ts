import client from './client';
import type { ApiResponse, Merchant, Pagination } from '../types';

interface MerchantListParams {
  page?: number;
  limit?: number;
  business_type?: string;
  proximity?: string;
  search?: string;
}

export const listMerchants = (params?: MerchantListParams) =>
  client.get<ApiResponse<{ merchants: Merchant[]; pagination: Pagination }>>('/public/merchants', { params });

export const getMerchant = (id: string) =>
  client.get<ApiResponse<{ merchant: Merchant }>>(`/public/merchants/${id}`);

export const getBusinessTypes = () =>
  client.get<ApiResponse<{ business_types: string[] }>>('/public/business-types');
