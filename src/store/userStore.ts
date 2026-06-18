import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { authApi } from '../services/api';

interface UserState {
  user: User | null;
  token: string | null;
  role: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  
  // Actions
  login: (username: string, password: string) => Promise<void>;
  adminLogin: (username: string, password: string) => Promise<void>;
  register: (data: { username: string; email: string; password: string; nickname: string }) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  setUser: (user: User) => void;
  updateExp: (exp: number) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,

      login: async (username: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login({ username, password });
          const userRole = response.user?.role || 'user';
          localStorage.setItem('token', response.token);
          set({
            user: response.user,
            token: response.token,
            role: userRole,
            isAuthenticated: true,
            isAdmin: userRole === 'admin',
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      adminLogin: async (username: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authApi.adminLogin({ username, password });
          const userRole = response.user?.role || 'admin';
          localStorage.setItem('token', response.token);
          set({
            user: response.user,
            token: response.token,
            role: userRole,
            isAuthenticated: true,
            isAdmin: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const response = await authApi.register(data);
          const userRole = response.user?.role || 'user';
          localStorage.setItem('token', response.token);
          set({
            user: response.user,
            token: response.token,
            role: userRole,
            isAuthenticated: true,
            isAdmin: userRole === 'admin',
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({
          user: null,
          token: null,
          role: null,
          isAuthenticated: false,
          isAdmin: false,
        });
      },

      fetchUser: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
          const response = await authApi.getMe();
          const userRole = response.user?.role || 'user';
          set({
            user: response.user,
            token,
            role: userRole,
            isAuthenticated: true,
            isAdmin: userRole === 'admin',
          });
        } catch {
          localStorage.removeItem('token');
          set({
            user: null,
            token: null,
            role: null,
            isAuthenticated: false,
            isAdmin: false,
          });
        }
      },

      setUser: (user: User) => {
        const userRole = user?.role || 'user';
        set({
          user,
          role: userRole,
          isAdmin: userRole === 'admin',
        });
      },

      updateExp: (exp: number) => {
        const { user } = get();
        if (user) {
          // 计算新的血统等级
          // D: 0-999, C: 1000-4999, B: 5000-14999, A: 15000-49999, S: 50000+
          let newBloodline = 'D';
          if (exp >= 50000) newBloodline = 'S';
          else if (exp >= 15000) newBloodline = 'A';
          else if (exp >= 5000) newBloodline = 'B';
          else if (exp >= 1000) newBloodline = 'C';

          set({
            user: {
              ...user,
              exp,
              bloodline: newBloodline,
            },
          });
        }
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        token: state.token,
      }),
    }
  )
);