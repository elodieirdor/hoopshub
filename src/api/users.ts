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

export const uploadAvatar = async (uri: string): Promise<User> => {
  const filename = uri.split('/').pop() ?? 'avatar.jpg';
  const ext = (filename.split('.').pop() ?? 'jpg').toLowerCase();
  const type = ext === 'png' ? 'image/png' : 'image/jpeg';
  const formData = new FormData();
  formData.append('avatar', { uri, name: filename, type } as unknown as Blob);
  const res = await client.post<User>('/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const searchInvitable = async (gameId: number, query: string): Promise<User[]> => {
  const res = await client.get<User[]>(`/games/${gameId}/invitable`, { params: { q: query } });
  return res.data;
};
