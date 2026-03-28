import { queryOptions } from '@tanstack/react-query';
import { getCourts, getCourt } from './courts';
import { getGames, getGame, getMyGames, getCourtGames, GetGamesParams } from './games';
import { getUser } from './users';
import { getMyInvitations, getGameInvitations } from './invitations';
import { City } from '@/types';

// All keys follow a consistent hierarchy so a single top-level invalidation
// (e.g. queryKey: ['games']) busts every game-related query at once.

export const courtQueries = {
  list: (city: City | null | undefined) =>
    queryOptions({
      queryKey: ['courts', 'list', city?.id] as const,
      queryFn: () =>
        getCourts({ lat: city?.lat, lng: city?.lng, radius_km: city?.radius_km ?? 30 }),
      enabled: !!city,
      staleTime: 60 * 60 * 1000,
    }),
  detail: (id: number | string) =>
    queryOptions({
      queryKey: ['courts', 'detail', Number(id)] as const,
      queryFn: () => getCourt(Number(id)),
      enabled: !!id,
      staleTime: 30 * 60 * 1000,
    }),
};

export const gameQueries = {
  feedForCity: (city: City | null | undefined, enabled: boolean) =>
    queryOptions({
      queryKey: ['games', 'feed', city?.id] as const,
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
      queryKey: ['games', 'list', params] as const,
      queryFn: () => getGames(params),
      staleTime: 2 * 60 * 1000,
    }),
  detail: (id: number | string) =>
    queryOptions({
      queryKey: ['games', 'detail', Number(id)] as const,
      queryFn: () => getGame(Number(id)),
      enabled: !!id,
      staleTime: 1 * 60 * 1000,
    }),
  forCourt: (courtId: number) =>
    queryOptions({
      queryKey: ['games', 'court', courtId] as const,
      queryFn: () => getCourtGames(courtId),
      enabled: !!courtId,
      staleTime: 2 * 60 * 1000,
    }),
  myUpcoming: () =>
    queryOptions({
      queryKey: ['games', 'upcoming'] as const,
      queryFn: () => getMyGames('upcoming'),
      staleTime: 2 * 60 * 1000,
    }),
};

export const userQueries = {
  detail: (id: number | string) =>
    queryOptions({
      queryKey: ['users', 'detail', Number(id)] as const,
      queryFn: () => getUser(Number(id)),
      enabled: !!id,
    }),
};

export const invitationQueries = {
  myPending: () =>
    queryOptions({
      queryKey: ['invitations', 'pending'] as const,
      queryFn: () => getMyInvitations(),
      staleTime: 1 * 60 * 1000,
    }),
  forGame: (gameId: number) =>
    queryOptions({
      queryKey: ['invitations', 'game', gameId] as const,
      queryFn: () => getGameInvitations(gameId),
      enabled: !!gameId,
      staleTime: 30 * 1000,
    }),
};
