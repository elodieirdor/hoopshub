import client from './client';
import { GameInvitation, User } from '@/types';

export const getMyInvitations = async (): Promise<GameInvitation[]> => {
  const res = await client.get<GameInvitation[]>('/invitations');
  return res.data;
};

export const sendInvitation = async (gameId: number, inviteeId: number) => {
  const res = await client.post(`/games/${gameId}/invitations`, { invitee_id: inviteeId });
  return res.data;
};

export const respondToInvitation = async (
  invitationId: number,
  status: 'accepted' | 'declined',
) => {
  const res = await client.patch(`/invitations/${invitationId}`, { status });
  return res.data;
};

export const searchInvitable = async (gameId: number, query: string): Promise<User[]> => {
  const res = await client.get<User[]>(`/games/${gameId}/invitable`, { params: { q: query } });
  return res.data;
};

export const getGameInvitations = async (gameId: number): Promise<GameInvitation[]> => {
  const res = await client.get<GameInvitation[]>(`/games/${gameId}/invitations`);
  return res.data;
};
