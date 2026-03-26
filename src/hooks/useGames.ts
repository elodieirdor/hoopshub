import { useQuery } from '@tanstack/react-query';
import { getGames } from '@/api/games';
import { gameQueries } from '@/api/queries';

type GetGamesParams = Parameters<typeof getGames>[0];

export function useGames(params?: GetGamesParams) {
  const {
    data: games = [],
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useQuery(gameQueries.list(params));

  return {
    games,
    loading: isLoading,
    refreshing: isRefetching,
    error: error ? 'Failed to load games' : null,
    refresh: refetch,
  };
}
