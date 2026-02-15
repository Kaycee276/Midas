import { create } from 'zustand';
import type { UserRole, Merchant, Student, Admin, AuthUser } from '../types';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, role: UserRole, data: Merchant | Student | Admin) => void;
  logout: () => void;
  updateUser: (data: Merchant | Student | Admin) => void;
}

function loadInitialState(): { user: AuthUser | null; token: string | null } {
  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  const storedRole = localStorage.getItem('role') as UserRole | null;

  if (storedToken && storedUser && storedRole) {
    try {
      const userData = JSON.parse(storedUser);
      return {
        token: storedToken,
        user: { id: userData.id, role: storedRole, data: userData },
      };
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
    }
  }
  return { user: null, token: null };
}

const initial = loadInitialState();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initial.user,
  token: initial.token,
  isAuthenticated: !!initial.token,
  isLoading: false,

  login: (newToken, role, data) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(data));
    localStorage.setItem('role', role);
    set({ token: newToken, user: { id: data.id, role, data }, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    set({ token: null, user: null, isAuthenticated: false });
  },

  updateUser: (data) => {
    const { user } = get();
    if (user) {
      localStorage.setItem('user', JSON.stringify(data));
      set({ user: { ...user, data } });
    }
  },
}));

export const useAuth = () => useAuthStore();
