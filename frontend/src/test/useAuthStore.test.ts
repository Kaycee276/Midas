import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../stores/useAuthStore';
import type { Student } from '../types';

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().logout();
  });

  it('starts unauthenticated after logout', () => {
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
  });

  it('updates state and localStorage on login', () => {
    const mockStudent: Student = {
      id: 'student-uuid-1',
      email: 'student@example.com',
      full_name: 'John Doe',
      account_status: 'active',
      is_verified: true,
      wallet_balance: 1000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      terms_accepted: true,
    };

    useAuthStore.getState().login('mock-jwt-token', 'student', mockStudent);

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().token).toBe('mock-jwt-token');
    expect(useAuthStore.getState().user?.role).toBe('student');
    expect(useAuthStore.getState().user?.id).toBe('student-uuid-1');
    expect(localStorage.getItem('token')).toBe('mock-jwt-token');
    expect(localStorage.getItem('role')).toBe('student');
  });

  it('clears state and localStorage on logout', () => {
    useAuthStore.getState().logout();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
