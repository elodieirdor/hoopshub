import client from './client';
import { User, PublicProfile } from '@/types';

export const getProfile = async (id: number) => {
  const res = await client.get<User>(`/users/${id}`);
  return res.data;
};

export const updateProfile = async (id: number, data: Partial<User>) => {
  const res = await client.put<User>(`/users/${id}`, data);
  return res.data;
};

export const getPublicProfile = async (id: number): Promise<PublicProfile> => {
  const res = await client.get<PublicProfile>(`/users/${id}`);
  return res.data;
};

export const searchInvitable = async (gameId: number, query: string): Promise<User[]> => {
  const res = await client.get<User[]>(`/games/${gameId}/invitable`, { params: { q: query } });
  return res.data;
};
