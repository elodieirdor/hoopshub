import { useState, useEffect, useCallback } from 'react';
import { getGames } from '@/api/games';
import { Game } from '@/types';

type GetGamesParams = Parameters<typeof getGames>[0];

export function useGames(params?: GetGamesParams) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    try {
      setError(null);
      const data = await getGames(params);
      setGames(data);
    } catch {
      setError('Failed to load games');
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    setLoading(true);
    fetchGames().finally(() => setLoading(false));
  }, [fetchGames]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchGames();
    setRefreshing(false);
  }, [fetchGames]);

  return { games, setGames, loading, refreshing, error, refresh };
}
