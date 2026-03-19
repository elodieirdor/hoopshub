import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import * as AuthApi from '../api/auth';
import { router } from 'expo-router';
import {User} from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Parameters<typeof AuthApi.register>[0]) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  loadUser: async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const user = await AuthApi.me();
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch {
      await SecureStore.deleteItemAsync('auth_token');
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    const { token, user } = await AuthApi.login({ email, password });
    await SecureStore.setItemAsync('auth_token', token);
    set({ user, token, isAuthenticated: true });
  },

  register: async (data) => {
    const { token, user } = await AuthApi.register(data);
    await SecureStore.setItemAsync('auth_token', token);
    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    await AuthApi.logout();
    await SecureStore.deleteItemAsync('auth_token');
    set({ user: null, token: null, isAuthenticated: false });
    router.replace('/(auth)/login');
  },
}));