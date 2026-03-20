import client from './client';
import { Court } from '@/types';

export const getCourts = async (params?: {
  city?: string;
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
