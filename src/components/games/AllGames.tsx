import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { gameQueries } from '@/api/queries';
import { GameCard } from '@/components/games/GameCard';
import { GameCardSkeleton } from '@/components/games/GameCardSkeleton';
import { FilterChips } from '@/components/ui/FilterChips';
import { ErrorState } from '@/components/ui/ErrorState';
import { applyFilters, type FilterKey } from '@/utils/gameFilters';
import { useLocationStore } from '@/store/locationStore';

const CHIPS: { key: FilterKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'weekend', label: 'This weekend' },
  { key: 'intermediate', label: 'Intermediate' },
  { key: '3v3', label: '3v3' },
  { key: 'nearme', label: 'Near me' },
];

export default function AllGames() {
  const { activeCity, locationReady } = useLocationStore();

  const {
    data: games = [],
    isLoading: loading,
    isRefetching: refreshing,
    error: gamesError,
    refetch: refresh,
  } = useQuery(gameQueries.feedForCity(activeCity, locationReady && !!activeCity));

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

  return (
    <View className="pt-4 pb-2">
      <View className="pl-4">
        <Text className="font-display text-2xl text-cream mb-3">ALL GAMES</Text>
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
          style={{ flex: 1 }}
          scrollEnabled={false}
          data={filtered}
          keyExtractor={(g) => g.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 32 }}
          renderItem={({ item }) => <GameCard game={item} />}
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
