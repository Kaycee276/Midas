import client from './client';
import type { ApiResponse, MerchantWalletInfo, MerchantWalletTransaction, Pagination } from '../types';

export const getMerchantWalletInfo = () =>
  client.get<ApiResponse<MerchantWalletInfo>>('/merchant-wallet');

export const merchantWithdraw = (amount: number) =>
  client.post<ApiResponse<{ transaction: MerchantWalletTransaction }>>('/merchant-wallet/withdraw', { amount });

export const getMerchantTransactionHistory = (params?: { page?: number; limit?: number }) =>
  client.get<ApiResponse<{ transactions: MerchantWalletTransaction[]; pagination: Pagination }>>('/merchant-wallet/transactions', { params });
