import client from './client';
import { Court } from '@/types';

export const getCourts = async (params?: {
  lat?: number;
  lng?: number;
  radius_km?: number;
  court_type?: string;
  lit?: boolean;
  is_free?: boolean;
}) => {
  const res = await client.get<Court[]>('/courts', { params });
  return res.data;
};

export const getCourt = async (id: number) => {
  const res = await client.get<Court>(`/courts/${id}`);
  return res.data;
};

export const createCourt = async (data: Partial<Court>) => {
  const res = await client.post<Court>('/courts', data);
  return res.data;
};

export const updateCourt = async (id: number, data: Partial<Court>) => {
  const res = await client.put<Court>(`/courts/${id}`, data);
  return res.data;
};

export const addToFavorite = async (courtId: number): Promise<{ favorited: boolean }> => {
  const res = await client.post<{ favorited: boolean }>(`/courts/${courtId}/favorite`);
  return res.data;
};

export const destroyFavorite = async (courtId: number): Promise<{ favorited: boolean }> => {
  const res = await client.delete<{ favorited: boolean }>(`/courts/${courtId}/favorite`);
  return res.data;
};
