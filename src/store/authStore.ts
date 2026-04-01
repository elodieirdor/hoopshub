import { create } from 'zustand';
import * as AuthApi from '../api/auth';
import { deletePushToken } from '../api/notifications';
import { router } from 'expo-router';
import { User } from '@/types';
import { storage } from '@/utils/storage';
import { useLocationStore } from './locationStore';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Parameters<typeof AuthApi.register>[0]) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  loadUser: async () => {
    try {
      const token = await storage.get('auth_token');
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const user = await AuthApi.me();
      set({ user, token, isAuthenticated: true, isLoading: false });
      useLocationStore.getState().syncCityWithUser(user.city);
    } catch {
      await storage.delete('auth_token');
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    const { token, user } = await AuthApi.login({ email, password });
    await storage.set('auth_token', token);
    set({ user, token, isAuthenticated: true });
    useLocationStore.getState().syncCityWithUser(user.city);
  },

  register: async (data) => {
    const { token, user } = await AuthApi.register(data);
    await storage.set('auth_token', token);
    set({ user, token, isAuthenticated: true });
    useLocationStore.getState().syncCityWithUser(user.city);
  },

  setUser: (user) => set({ user }),

  logout: async () => {
    try {
      await deletePushToken();
    } catch {
      /* swallow — non-fatal */
    }
    await AuthApi.logout();
    await storage.delete('auth_token');
    await storage.set('notification_enabled', 'false');
    // notification_prompt_shown is intentionally preserved across logout
    set({ user: null, token: null, isAuthenticated: false });
    router.replace('/(auth)/login');
  },
}));
