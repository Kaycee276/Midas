import client from './client';
import type { ApiResponse, KYC } from '../types';

export const submitKYC = (formData: FormData) =>
  client.post<ApiResponse<{ kyc: KYC }>>('/kyc/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getKYCStatus = () =>
  client.get<ApiResponse<{ kyc: KYC }>>('/kyc/status');

export const getDocument = (type: string) =>
  client.get<ApiResponse<{ url: string }>>(`/kyc/documents/${type}`);

export const deleteDocument = (type: string) =>
  client.delete<ApiResponse<{ message: string }>>(`/kyc/document/${type}`);
