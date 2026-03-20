import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { router } from 'expo-router';
import { storage } from '@/utils/storage';

const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Attach token to every request
client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await storage.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401s globally — clear token and redirect to login
client.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: unknown) => {
    if ((error as { response?: { status?: number } }).response?.status === 401) {
      await storage.delete('auth_token');
      router.replace('/(auth)/login');
    }
    return Promise.reject(error);
  }
);

export default client;
