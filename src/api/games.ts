import client from './client';
import { Game } from '@/types';

export const getCourtGames = async (id: number) => {
  const res = await client.get<Game[]>(`/courts/${id}/games`);
  return res.data;
};

// todo use type here
export const getGames = async (params?: {
  lat?: number;
  lng?: number;
  radius_km?: number;
  skill_level?: string;
  status?: string;
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
  const res = await client.post(`/games/${id}/players`);
  return res.data;
};

export const leaveGame = async (id: number) => {
  await client.delete(`/games/${id}/players`);
};

export const updateGame = async (id: number, data: Partial<Game>) => {
  const res = await client.put<Game>(`/games/${id}`, data);
  return res.data;
};

export const deleteGame = async (id: number) => {
  await client.delete(`/games/${id}`);
};

export const MY_GAMES_KEY = ['my-games'] as const;

export const getMyGames = async (type: 'upcoming' | 'past' = 'upcoming') => {
  const res = await client.get<Game[]>('/users/me/games', { params: { type } });
  return res.data;
};
