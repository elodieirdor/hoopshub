import client from './client';
import { CurrentUser } from '@/types';

export const register = async (data: {
  full_name: string;
  email: string;
  password: string;
  city?: string;
  skill_level?: string;
}) => {
  const res = await client.post<{ token: string; user: CurrentUser }>('/users', data);
  return res.data;
};

export const login = async (data: { email: string; password: string }) => {
  const res = await client.post<{ token: string; user: CurrentUser }>('/tokens', data);
  return res.data;
};

export const logout = async () => {
  await client.delete('/tokens');
};

export const me = async () => {
  const res = await client.get<CurrentUser>('/me');
  return res.data;
};
