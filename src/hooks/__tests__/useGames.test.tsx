import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGames } from '../useGames';
import { getGames } from '@/api/games';
import { Game } from '@/types';
import { makeGame } from '@/test/factories';

jest.mock('@/api/games');

const mockedGetGames = getGames as jest.MockedFunction<typeof getGames>;

const mockGame = makeGame({ id: 42 });

// Fresh QueryClient per test — no cache bleed, retries disabled for speed
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return Wrapper;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useGames', () => {
  it('starts in loading state', () => {
    mockedGetGames.mockResolvedValue([]);
    const { result } = renderHook(() => useGames(), { wrapper: createWrapper() });
    expect(result.current.loading).toBe(true);
    expect(result.current.games).toEqual([]);
  });

  it('populates games on successful fetch', async () => {
    mockedGetGames.mockResolvedValue([mockGame]);

    const { result } = renderHook(() => useGames(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.games).toEqual([mockGame]);
    expect(result.current.error).toBeNull();
  });

  it('sets error on failed fetch', async () => {
    mockedGetGames.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useGames(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Failed to load games');
    expect(result.current.games).toEqual([]);
  });

  it('passes params to getGames', async () => {
    mockedGetGames.mockResolvedValue([]);

    renderHook(() => useGames({ city: 'Christchurch', status: 'open' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockedGetGames).toHaveBeenCalledWith({ city: 'Christchurch', status: 'open' });
    });
  });

  it('refresh reloads games and clears error', async () => {
    mockedGetGames.mockRejectedValueOnce(new Error('fail')).mockResolvedValueOnce([mockGame]);

    const { result } = renderHook(() => useGames(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.error).toBe('Failed to load games'));

    await act(async () => {
      await result.current.refresh();
    });

    await waitFor(() => expect(result.current.games).toEqual([mockGame]));
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

    const { result } = renderHook(() => useGames(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.refresh();
    });

    await waitFor(() => expect(result.current.refreshing).toBe(true));

    await act(async () => {
      resolve!([]);
    });

    await waitFor(() => expect(result.current.refreshing).toBe(false));
  });
});
