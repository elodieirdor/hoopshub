import { getMyInvitations, sendInvitation, respondToInvitation } from '../invitations';
import client from '../client';
import { makeUser, makeInvitation } from '@/test/factories';

jest.mock('../client');

const mockedClient = client as jest.Mocked<typeof client>;

const mockInvitation = makeInvitation({
  id: 1,
  game_id: 10,
  inviter_id: 1,
  invitee_id: 2,
  created_at: '2026-03-24T00:00:00Z',
  inviter: makeUser({ id: 1, name: 'Alex', username: 'alex' }),
});

describe('getMyInvitations', () => {
  it('fetches invitations from /invitations', async () => {
    mockedClient.get = jest.fn().mockResolvedValue({ data: [mockInvitation] });

    const result = await getMyInvitations();

    expect(mockedClient.get).toHaveBeenCalledWith('/invitations');
    expect(result).toEqual([mockInvitation]);
  });

  it('returns empty array when no invitations', async () => {
    mockedClient.get = jest.fn().mockResolvedValue({ data: [] });

    const result = await getMyInvitations();

    expect(result).toEqual([]);
  });
});

describe('sendInvitation', () => {
  it('posts to the game invitations endpoint with invitee_id', async () => {
    mockedClient.post = jest.fn().mockResolvedValue({ data: mockInvitation });

    const result = await sendInvitation(10, 2);

    expect(mockedClient.post).toHaveBeenCalledWith('/games/10/invitations', { invitee_id: 2 });
    expect(result).toEqual(mockInvitation);
  });
});

describe('respondToInvitation', () => {
  it('accepts an invitation', async () => {
    const accepted = { ...mockInvitation, status: 'accepted' as const };
    mockedClient.patch = jest.fn().mockResolvedValue({ data: accepted });

    const result = await respondToInvitation(1, 'accepted');

    expect(mockedClient.patch).toHaveBeenCalledWith('/invitations/1', { status: 'accepted' });
    expect(result).toEqual(accepted);
  });

  it('declines an invitation', async () => {
    const declined = { ...mockInvitation, status: 'declined' as const };
    mockedClient.patch = jest.fn().mockResolvedValue({ data: declined });

    await respondToInvitation(1, 'declined');

    expect(mockedClient.patch).toHaveBeenCalledWith('/invitations/1', { status: 'declined' });
  });
});
