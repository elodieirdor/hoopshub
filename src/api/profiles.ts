import client from './client';
import { User } from '@/types';

export const getProfile = async (id: number) => {
  const res = await client.get<User>(`/users/${id}`);
  return res.data;
};

export const updateProfile = async (id: number, data: Partial<User>) => {
  const res = await client.put<User>(`/users/${id}`, data);
  return res.data;
};
