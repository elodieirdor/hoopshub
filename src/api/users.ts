import client from './client';
import { User } from '@/types';

export const getUser = async (id: number) => {
  const res = await client.get<User>(`/users/${id}`);
  return res.data;
};

export const updateMe = async (data: Partial<User>) => {
  const res = await client.put<User>('/me', data);
  return res.data;
};

export const searchInvitable = async (gameId: number, query: string): Promise<User[]> => {
  const res = await client.get<User[]>(`/games/${gameId}/invitable`, { params: { q: query } });
  return res.data;
};
