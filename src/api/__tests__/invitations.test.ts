import { getMyInvitations, sendInvitation, respondToInvitation } from '../invitations';
import client from '../client';
import { GameInvitation, Game, User, Court } from '@/types';

jest.mock('../client');

const mockedClient = client as jest.Mocked<typeof client>;

const mockUser: User = {
  id: 1,
  name: 'Alex',
  username: 'alex',
  city: null,
  position: null,
  skill_level: 'intermediate',
  avatar_url: null,
  games_played: 0,
  avg_rating: 0,
};

const mockCourt: Court = {
  id: 1,
  name: 'Cowles',
  address: '751 Pages Rd',
  city: 'Christchurch',
  lat: -43.504,
  lng: 172.675,
  court_type: 'indoor',
  surface: 'hardwood',
  full_court: true,
  lit: true,
  is_free: false,
  images: [],
};

const mockGame: Game = {
  id: 10,
  host_id: 1,
  court_id: 1,
  title: 'Friday Pickup',
  description: null,
  starts_at: '2026-04-01T18:00:00Z',
  duration_mins: 90,
  max_players: 10,
  skill_level: 'intermediate',
  game_type: '5v5',
  status: 'open',
  created_at: '2026-01-01T00:00:00Z',
  host: mockUser,
  court: mockCourt,
  game_players: [],
};

const mockInvitation: GameInvitation = {
  id: 1,
  game_id: 10,
  inviter_id: 1,
  invitee_id: 2,
  status: 'pending',
  responded_at: null,
  created_at: '2026-03-24T00:00:00Z',
  game: mockGame,
  inviter: mockUser,
};

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
  it('posts to the game invite endpoint with invitee_id', async () => {
    mockedClient.post = jest.fn().mockResolvedValue({ data: mockInvitation });

    const result = await sendInvitation(10, 2);

    expect(mockedClient.post).toHaveBeenCalledWith('/games/10/invite', { invitee_id: 2 });
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
