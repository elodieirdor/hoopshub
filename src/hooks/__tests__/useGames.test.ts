import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useGames } from '../useGames';
import { getGames } from '@/api/games';
import { Game, Court, User } from '@/types';

jest.mock('@/api/games');

const mockedGetGames = getGames as jest.MockedFunction<typeof getGames>;

const mockUser: User = {
  id: 1,
  name: 'Alex',
  username: 'alex',
  city: 'Christchurch',
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
  id: 42,
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

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useGames', () => {
  it('starts in loading state', () => {
    mockedGetGames.mockResolvedValue([]);
    const { result } = renderHook(() => useGames());
    expect(result.current.loading).toBe(true);
    expect(result.current.games).toEqual([]);
  });

  it('populates games on successful fetch', async () => {
    mockedGetGames.mockResolvedValue([mockGame]);

    const { result } = renderHook(() => useGames());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.games).toEqual([mockGame]);
    expect(result.current.error).toBeNull();
  });

  it('sets error on failed fetch', async () => {
    mockedGetGames.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useGames());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Failed to load games');
    expect(result.current.games).toEqual([]);
  });

  it('passes params to getGames', async () => {
    mockedGetGames.mockResolvedValue([]);

    renderHook(() => useGames({ city: 'Christchurch', status: 'open' }));

    await waitFor(() => {
      expect(mockedGetGames).toHaveBeenCalledWith({ city: 'Christchurch', status: 'open' });
    });
  });

  it('refresh reloads games and clears error', async () => {
    mockedGetGames.mockRejectedValueOnce(new Error('fail')).mockResolvedValueOnce([mockGame]);

    const { result } = renderHook(() => useGames());

    await waitFor(() => expect(result.current.error).toBe('Failed to load games'));

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.games).toEqual([mockGame]);
    expect(result.current.error).toBeNull();
    expect(result.current.refreshing).toBe(false);
  });

  it('sets refreshing true during refresh', async () => {
    let resolve: (v: Game[]) => void;
    mockedGetGames.mockResolvedValueOnce([]).mockImplementationOnce(
      () =>
        new Promise((r) => {
          resolve = r;
        }),
    );

    const { result } = renderHook(() => useGames());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.refresh();
    });

    expect(result.current.refreshing).toBe(true);

    await act(async () => {
      resolve!([]);
    });

    expect(result.current.refreshing).toBe(false);
  });
});
