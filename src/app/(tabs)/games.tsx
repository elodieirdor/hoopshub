import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { getGames, joinGame, leaveGame } from '@/api/games';
import { Game } from '@/types';
import { GameCard } from '@/components/games/GameCard';
import { GameCardSkeleton } from '@/components/games/GameCardSkeleton';
import { FilterChips } from '@/components/ui/FilterChips';
import { ErrorState } from '@/components/ui/ErrorState';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type FilterKey, applyFilters } from '@/utils/gameFilters';
import { useLocationStore } from '@/store/locationStore';

const CHIPS: { key: FilterKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'weekend', label: 'This weekend' },
  { key: 'intermediate', label: 'Intermediate' },
  { key: '3v3', label: '3v3' },
  { key: 'nearme', label: 'Near me' },
];

export default function GamesScreen() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const currentUser = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const { userLat, userLng, activeCity, locationReady } = useLocationStore();

  const gamesParams = {
    lat: userLat ?? activeCity?.lat,
    lng: userLng ?? activeCity?.lng,
    radius_km: activeCity?.radius_km ?? 30,
    status: 'open' as const,
  };
  const GAMES_KEY = ['games', { cityId: activeCity?.id, status: 'open' }];

  const {
    data: games = [],
    isLoading: loading,
    isRefetching: refreshing,
    error: gamesError,
    refetch: refresh,
  } = useQuery({
    queryKey: GAMES_KEY,
    queryFn: () => getGames(gamesParams),
    enabled: locationReady,
  });

  const [activeFilters, setActiveFilters] = useState<Set<FilterKey>>(new Set());
  const filtered = useMemo(() => applyFilters(games, activeFilters), [games, activeFilters]);

  const toggleFilter = (key: FilterKey) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const joinMutation = useMutation({
    mutationFn: (id: number) => joinGame(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: GAMES_KEY });
      const prev = queryClient.getQueryData<Game[]>(GAMES_KEY);
      queryClient.setQueryData<Game[]>(GAMES_KEY, (old = []) =>
        old.map((g) => {
          if (g.id !== id) return g;
          const newFilled = (g.game_players?.length ?? 0) + 1;
          return {
            ...g,
            game_players: [
              ...(g.game_players ?? []),
              {
                id: -1,
                game_id: id,
                player_id: currentUser?.id ?? -1,
                joined_at: new Date().toISOString(),
                player: currentUser!,
              },
            ],
            status: newFilled >= g.max_players ? ('full' as const) : g.status,
          };
        }),
      );
      return { prev };
    },
    onError: (_, __, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(GAMES_KEY, ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['games'] }),
  });

  const leaveMutation = useMutation({
    mutationFn: (id: number) => leaveGame(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: GAMES_KEY });
      const prev = queryClient.getQueryData<Game[]>(GAMES_KEY);
      queryClient.setQueryData<Game[]>(GAMES_KEY, (old = []) =>
        old.map((g) => {
          if (g.id !== id) return g;
          return {
            ...g,
            game_players: (g.game_players ?? []).filter((p) => p.player.id !== currentUser?.id),
            status: 'open' as const,
          };
        }),
      );
      return { prev };
    },
    onError: (_, __, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(GAMES_KEY, ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['games'] }),
  });

  return (
    <View className="flex-1 bg-dark" style={{ paddingTop: top, paddingBottom: bottom }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <Text className="font-display text-4xl text-cream">PICKUP GAMES</Text>
        <Pressable
          onPress={() => router.push('/games/create')}
          className="bg-orange rounded-lg px-3 py-2"
        >
          <Text className="text-cream font-sans font-semibold text-sm">Post game</Text>
        </Pressable>
      </View>

      {/* Filter chips */}
      <FilterChips
        chips={CHIPS}
        isActive={(key) => activeFilters.has(key)}
        onPress={toggleFilter}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />

      {/* Game list */}
      {loading ? (
        <View className="px-4 pt-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <GameCardSkeleton key={i} />
          ))}
        </View>
      ) : gamesError ? (
        <ErrorState message="Failed to load games" onRetry={refresh} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(g) => g.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 32 }}
          renderItem={({ item }) => (
            <GameCard
              game={item}
              onJoin={(id) => joinMutation.mutate(id)}
              onLeave={(id) => leaveMutation.mutate(id)}
              joining={joinMutation.isPending && joinMutation.variables === item.id}
              leaving={leaveMutation.isPending && leaveMutation.variables === item.id}
            />
          )}
          ListEmptyComponent={
            <View className="items-center pt-16 px-8">
              <Text className="text-muted font-sans text-center mb-3">
                {activeFilters.size > 0 ? 'No games match your filters.' : 'No games found.'}
              </Text>
              {activeFilters.size > 0 && (
                <Pressable className="self-center" onPress={() => setActiveFilters(new Set())}>
                  <Text className="text-orange font-sans text-sm">Clear filters</Text>
                </Pressable>
              )}
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#FF5C00" />
          }
        />
      )}
    </View>
  );
}
