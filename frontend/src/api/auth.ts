import client from './client';
import type { ApiResponse, Merchant, Student, MerchantRegisterData, StudentRegisterData, LoginData } from '../types';

// Merchant auth
export const merchantRegister = (data: MerchantRegisterData) =>
  client.post<ApiResponse<{ merchant: Merchant; token: string }>>('/auth/register', data);

export const merchantLogin = (data: LoginData) =>
  client.post<ApiResponse<{ merchant: Merchant; token: string }>>('/auth/login', data);

export const getMerchantProfile = () =>
  client.get<ApiResponse<{ merchant: Merchant }>>('/auth/me');

export const updateMerchantProfile = (data: Partial<MerchantRegisterData>) =>
  client.patch<ApiResponse<{ merchant: Merchant }>>('/auth/profile', data);

// Student auth
export const studentRegister = (data: StudentRegisterData) =>
  client.post<ApiResponse<{ student: Student; token: string }>>('/students/register', data);

export const studentLogin = (data: LoginData) =>
  client.post<ApiResponse<{ student: Student; token: string }>>('/students/login', data);

export const getStudentProfile = () =>
  client.get<ApiResponse<{ student: Student }>>('/students/me');

export const updateStudentProfile = (data: Partial<StudentRegisterData>) =>
  client.patch<ApiResponse<{ student: Student }>>('/students/profile', data);

// Email verification
export const verifyEmail = (token: string) =>
  client.get<ApiResponse<null>>('/auth/verify-email', { params: { token } });

export const resendVerification = (email: string, type: 'merchant' | 'student') =>
  client.post<ApiResponse<null>>('/auth/resend-verification', { email, type });
