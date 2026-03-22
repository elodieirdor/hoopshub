import { getGames, joinGame, leaveGame, deleteGame } from '../games';
import client from '../client';
import { Game, Court, Profile } from '@/types';

jest.mock('../client');

const mockedClient = client as jest.Mocked<typeof client>;

const mockCourt: Court = {
  id: 1,
  name: 'Cowles Stadium',
  address: '751 Pages Road, Christchurch',
  lat: -43.504,
  lng: 172.675,
  city: 'Christchurch',
  court_type: 'indoor',
  surface: 'hardwood',
  full_court: true,
  lit: true,
  is_free: false,
  added_by: null,
};

const mockHost: Profile = {
  id: 99,
  user_id: 99,
  username: 'ballerNZ',
  full_name: 'Alex Baller',
  city: 'Christchurch',
  position: 'Guard',
  skill_level: 'intermediate',
  avatar_url: null,
  games_played: 10,
  avg_rating: 4.5,
};

const mockGame: Game = {
  id: 42,
  host_id: 99,
  court_id: 1,
  title: 'Friday Pickup',
  description: '5v5 at Cowles',
  starts_at: '2026-04-01T18:00:00Z',
  duration_mins: 90,
  max_players: 10,
  skill_level: 'intermediate',
  game_type: '5v5',
  status: 'open',
  host: mockHost,
  court: mockCourt,
  game_players: [],
  created_at: '2026-01-01T00:00:00Z',
};

describe('getGames', () => {
  it('fetches games without params', async () => {
    mockedClient.get = jest.fn().mockResolvedValue({ data: [mockGame] });

    const result = await getGames();

    expect(mockedClient.get).toHaveBeenCalledWith('/games', { params: undefined });
    expect(result).toEqual([mockGame]);
  });

  it('passes court_id param', async () => {
    mockedClient.get = jest.fn().mockResolvedValue({ data: [mockGame] });

    await getGames({ court_id: 1 });

    expect(mockedClient.get).toHaveBeenCalledWith('/games', { params: { court_id: 1 } });
  });

  it('passes city and skill_level params', async () => {
    mockedClient.get = jest.fn().mockResolvedValue({ data: [] });

    await getGames({ city: 'Christchurch', skill_level: 'beginner' });

    expect(mockedClient.get).toHaveBeenCalledWith('/games', {
      params: { city: 'Christchurch', skill_level: 'beginner' },
    });
  });
});

describe('joinGame', () => {
  it('posts to the join endpoint', async () => {
    mockedClient.post = jest.fn().mockResolvedValue({ data: { success: true } });

    const result = await joinGame(42);

    expect(mockedClient.post).toHaveBeenCalledWith('/games/42/join');
    expect(result).toEqual({ success: true });
  });
});

describe('leaveGame', () => {
  it('posts to the leave endpoint', async () => {
    mockedClient.post = jest.fn().mockResolvedValue({ data: { success: true } });

    const result = await leaveGame(42);

    expect(mockedClient.post).toHaveBeenCalledWith('/games/42/leave');
    expect(result).toEqual({ success: true });
  });
});

describe('deleteGame', () => {
  it('sends a DELETE request', async () => {
    mockedClient.delete = jest.fn().mockResolvedValue({});

    await deleteGame(42);

    expect(mockedClient.delete).toHaveBeenCalledWith('/games/42');
  });
});
