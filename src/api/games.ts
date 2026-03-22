import client from './client';
import { Game } from '@/types';

export const getGames = async (params?: {
  city?: string;
  skill_level?: string;
  status?: string;
  court_id?: number;
}) => {
  const res = await client.get<Game[]>('/games', { params });
  return res.data;
};

export const getGame = async (id: number) => {
  const res = await client.get<Game>(`/games/${id}`);
  return res.data;
};

export const createGame = async (data: {
  court_id: number;
  title: string;
  description?: string;
  starts_at: string;
  duration_mins?: number;
  max_players?: number;
  skill_level: string;
  game_type: string;
}) => {
  const res = await client.post<Game>('/games', data);
  return res.data;
};

export const joinGame = async (id: number) => {
  const res = await client.post(`/games/${id}/join`);
  return res.data;
};

export const leaveGame = async (id: number) => {
  const res = await client.post(`/games/${id}/leave`);
  return res.data;
};

export const updateGame = async (id: number, data: Partial<Game>) => {
  const res = await client.put<Game>(`/games/${id}`, data);
  return res.data;
};

export const deleteGame = async (id: number) => {
  await client.delete(`/games/${id}`);
};
