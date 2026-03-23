import client from './client';
import { GameInvitation } from '@/types';

export const getMyInvitations = async (): Promise<GameInvitation[]> => {
  const res = await client.get<GameInvitation[]>('/invitations');
  return res.data;
};

export const sendInvitation = async (gameId: number, inviteeId: number) => {
  const res = await client.post(`/games/${gameId}/invite`, { invitee_id: inviteeId });
  return res.data;
};

export const respondToInvitation = async (
  invitationId: number,
  status: 'accepted' | 'declined',
) => {
  const res = await client.patch(`/invitations/${invitationId}`, { status });
  return res.data;
};
