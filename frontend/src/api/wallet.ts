import client from './client';
import type { ApiResponse, WalletInfo, WalletTransaction, Pagination } from '../types';

export const getWalletInfo = (options?: { bypassCache?: boolean }) =>
  client.get<ApiResponse<WalletInfo>>('/wallet', options);

export const fundWallet = (amount: number) =>
  client.post<ApiResponse<{ transaction: WalletTransaction }>>('/wallet/fund', { amount });

export const withdrawFunds = (amount: number) =>
  client.post<ApiResponse<{ transaction: WalletTransaction }>>('/wallet/withdraw', { amount });

export const getTransactionHistory = (params?: { page?: number; limit?: number }) =>
  client.get<ApiResponse<{ transactions: WalletTransaction[]; pagination: Pagination }>>(
    '/wallet/transactions',
    { params }
  );
