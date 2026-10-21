import client from './client';
import type { ApiResponse, WalletInfo, WalletTransaction, Pagination } from '../types';

export const getWalletInfo = (options?: { bypassCache?: boolean }) =>
  client.get<ApiResponse<WalletInfo>>('/wallet', options);

export const fundWallet = (amount: number) =>
  client.post<ApiResponse<{ transaction: WalletTransaction }>>('/wallet/fund', { amount });

export const initiateBachsCheckout = (amount: number) =>
  client.post<
    ApiResponse<{
      checkout_url: string;
      checkout_id: string;
      reference: string;
      is_simulated: boolean;
    }>
  >('/wallet/fund/checkout', { amount });

export const checkPaymentStatus = (reference: string) =>
  client.get<ApiResponse<WalletTransaction>>(`/payments/status/${reference}`);

export const simulateSandboxPayment = (reference: string) =>
  client.post<ApiResponse<{ handled: boolean; balance_after?: number }>>(
    '/payments/simulate-sandbox-payment',
    { reference }
  );

export const withdrawFunds = (amount: number) =>
  client.post<ApiResponse<{ transaction: WalletTransaction }>>('/wallet/withdraw', { amount });

export const getTransactionHistory = (params?: { page?: number; limit?: number }) =>
  client.get<ApiResponse<{ transactions: WalletTransaction[]; pagination: Pagination }>>(
    '/wallet/transactions',
    { params }
  );
