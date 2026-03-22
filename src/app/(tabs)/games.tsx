import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { joinGame, leaveGame } from '@/api/games';
import { Game } from '@/types';
import { GameCard } from '@/components/games/GameCard';
import { GameCardSkeleton } from '@/components/games/GameCardSkeleton';
import { FilterChips } from '@/components/ui/FilterChips';
import { useGames } from '@/hooks/useGames';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type FilterKey, applyFilters } from '@/utils/gameFilters';

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
  const { games, setGames, loading, refreshing, error, refresh } = useGames({
    city: 'Christchurch',
    status: 'open',
  });

  const [activeFilters, setActiveFilters] = useState<Set<FilterKey>>(new Set());
  const [joiningId, setJoiningId] = useState<number | null>(null);
  const [leavingId, setLeavingId] = useState<number | null>(null);

  const filtered = useMemo(() => applyFilters(games, activeFilters), [games, activeFilters]);

  const toggleFilter = (key: FilterKey) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleJoin = async (id: number) => {
    setJoiningId(id);
    setGames((prev) =>
      prev.map((g) => {
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
              status: 'confirmed' as const,
              joined_at: new Date().toISOString(),
              player: currentUser!,
            },
          ],
          status: newFilled >= g.max_players ? ('full' as const) : g.status,
        };
      }),
    );
    try {
      await joinGame(id);
    } catch {
      setGames((prev) =>
        prev.map((g) => {
          if (g.id !== id) return g;
          return {
            ...g,
            game_players: (g.game_players ?? []).filter((p) => p.id !== -1),
            status: 'open' as const,
          };
        }),
      );
    } finally {
      setJoiningId(null);
    }
  };

  const handleLeave = async (id: number) => {
    setLeavingId(id);
    const snapshot = games.find((g) => g.id === id);
    setGames((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        return {
          ...g,
          game_players: (g.game_players ?? []).filter((p) => p.player.id !== currentUser?.id),
          status: 'open' as const,
        };
      }),
    );
    try {
      await leaveGame(id);
    } catch {
      if (snapshot) setGames((prev) => prev.map((g) => (g.id === id ? snapshot : g)));
    } finally {
      setLeavingId(null);
    }
  };

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
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-muted font-sans text-center">{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(g) => g.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 32 }}
          renderItem={({ item }) => (
            <GameCard
              game={item}
              onJoin={handleJoin}
              onLeave={handleLeave}
              joining={joiningId === item.id}
              leaving={leavingId === item.id}
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
