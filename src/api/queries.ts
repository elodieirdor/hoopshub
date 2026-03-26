import { queryOptions } from '@tanstack/react-query';
import { getCourts, getCourt } from './courts';
import { getGames, getGame, getMyGames, getCourtGames, GetGamesParams } from './games';
import { getUser } from './users';
import { City } from '@/types';

export const courtQueries = {
  list: (city: City | null | undefined) =>
    queryOptions({
      queryKey: ['courts', city?.id] as const,
      queryFn: () =>
        getCourts({ lat: city?.lat, lng: city?.lng, radius_km: city?.radius_km ?? 30 }),
      enabled: !!city,
      staleTime: 60 * 60 * 1000,
    }),
  detail: (id: number | string) =>
    queryOptions({
      queryKey: ['court', Number(id)] as const,
      queryFn: () => getCourt(Number(id)),
      enabled: !!id,
      staleTime: 30 * 60 * 1000,
    }),
};

export const gameQueries = {
  feedForCity: (city: City | null | undefined, enabled: boolean) =>
    queryOptions({
      queryKey: ['games', { cityId: city?.id, status: 'open' }] as const,
      queryFn: () =>
        getGames({
          lat: city?.lat,
          lng: city?.lng,
          radius_km: city?.radius_km ?? 30,
          status: 'open',
        }),
      enabled,
      staleTime: 2 * 60 * 1000,
    }),
  list: (params?: GetGamesParams) =>
    queryOptions({
      queryKey: ['games', params] as const,
      queryFn: () => getGames(params),
      staleTime: 2 * 60 * 1000,
    }),
  detail: (id: number | string) =>
    queryOptions({
      queryKey: ['game', Number(id)] as const,
      queryFn: () => getGame(Number(id)),
      enabled: !!id,
      staleTime: 1 * 60 * 1000,
    }),
  forCourt: (courtId: number) =>
    queryOptions({
      queryKey: ['games', { court_id: courtId }] as const,
      queryFn: () => getCourtGames(courtId),
      enabled: !!courtId,
    }),
  myUpcoming: () =>
    queryOptions({
      queryKey: ['my-games', 'upcoming'] as const,
      queryFn: () => getMyGames('upcoming'),
    }),
};

export const userQueries = {
  detail: (id: number | string) =>
    queryOptions({
      queryKey: ['user', Number(id)] as const,
      queryFn: () => getUser(Number(id)),
      enabled: !!id,
    }),
};
