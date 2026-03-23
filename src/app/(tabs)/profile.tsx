import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { getGames } from '@/api/games';
import { Badge } from '@/components/ui/Badge';
import { GameCard } from '@/components/games/GameCard';
import { GameCardSkeleton } from '@/components/games/GameCardSkeleton';
import { initials, SKILL_COLORS } from '@/utils/formatters';
import { Stars } from '@/components/ui/Stars';

export default function ProfileScreen() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const {
    data: recentGames = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['games', 'mine', user?.id, user?.city],
    queryFn: async () => {
      const all = await getGames({ city: user?.city ?? 'Christchurch' });
      return all
        .filter((g) => g.game_players?.some((p) => p.player_id === user!.id))
        .slice(-5)
        .reverse();
    },
    enabled: !!user,
  });

  const onRefresh = () => {
    refetch();
  };

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  if (!user) {
    return (
      <View className="flex-1 bg-dark items-center justify-center">
        <ActivityIndicator color="#FF5C00" />
      </View>
    );
  }

  const skillColor = SKILL_COLORS[user.skill_level] ?? '#7A7870';
  const avgRating = Number(user.avg_rating ?? 0);

  return (
    <ScrollView
      className="flex-1 bg-dark"
      style={{ paddingTop: top }}
      contentContainerStyle={{ paddingBottom: bottom + 32 }}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor="#FF5C00" />
      }
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <Text className="font-display text-4xl text-cream">PROFILE</Text>
        <Pressable onPress={() => router.push('/profile/edit')} hitSlop={12}>
          <Text className="text-orange font-sans text-sm font-semibold">Edit</Text>
        </Pressable>
      </View>

      {/* Identity */}
      <View className="items-center px-4 pt-6 pb-6">
        {/* Avatar */}
        <View
          className="rounded-full items-center justify-center mb-4"
          style={{ width: 72, height: 72, backgroundColor: '#FF5C00' }}
        >
          <Text className="text-cream font-sans font-bold text-2xl">{initials(user.name)}</Text>
        </View>

        {/* Name */}
        <Text className="font-display text-3xl text-cream mb-1">{user.name.toUpperCase()}</Text>

        {/* Username + city */}
        <Text className="text-muted font-sans text-sm mb-4">
          @{user.username}
          {user.city ? ` · ${user.city}` : ''}
        </Text>

        {/* Badges */}
        <View className="flex-row gap-2">
          <Badge
            label={user.skill_level.charAt(0).toUpperCase() + user.skill_level.slice(1)}
            color={skillColor}
          />
          {user.position && user.position !== 'Any' && (
            <Badge label={user.position} color="#7A7870" />
          )}
        </View>
      </View>

      {/* Divider */}
      <View
        style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: 16 }}
      />

      {/* Stats row */}
      <View className="flex-row px-4 py-5">
        <View className="flex-1 items-center">
          <Text className="font-display text-3xl text-cream">{user.games_played ?? 0}</Text>
          <Text className="text-muted font-sans text-xs mt-0.5">Games played</Text>
        </View>
        <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
        <View className="flex-1 items-center">
          <Text className="font-display text-3xl" style={{ color: '#FF5C00' }}>
            {avgRating > 0 ? avgRating.toFixed(1) : '—'}
          </Text>
          <Text className="text-muted font-sans text-xs mt-0.5">Avg rating</Text>
        </View>
        <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
        <View className="flex-1 items-center">
          <Text className="font-display text-3xl text-cream">—</Text>
          <Text className="text-muted font-sans text-xs mt-0.5">Courts visited</Text>
        </View>
      </View>

      {/* Divider */}
      <View
        style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: 16 }}
      />

      {/* Community rep */}
      <View className="px-4 pt-5 pb-4">
        <Text className="font-display text-2xl text-cream mb-4">COMMUNITY REP</Text>
        <View
          className="rounded-xl"
          style={{
            backgroundColor: '#181818',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)',
          }}
        >
          {[
            { label: 'Shows up on time', rating: avgRating },
            { label: 'Good sportsmanship', rating: avgRating },
            { label: 'Right skill level', rating: avgRating },
            { label: 'Fun to play with', rating: avgRating },
          ].map((row, i) => (
            <View key={row.label}>
              {i > 0 && <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />}
              <View className="flex-row items-center justify-between px-4 py-3">
                <Text className="text-cream font-sans text-sm flex-1">{row.label}</Text>
                {row.rating > 0 ? (
                  <Stars rating={row.rating} />
                ) : (
                  <Text className="text-muted font-sans text-xs">No ratings yet</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Recent games */}
      <View className="px-4 pt-2 pb-4">
        <Text className="font-display text-2xl text-cream mb-4">RECENT GAMES</Text>
        {isLoading ? (
          <>
            <GameCardSkeleton />
            <GameCardSkeleton />
          </>
        ) : recentGames.length === 0 ? (
          <View className="items-center py-8">
            <Ionicons name="basketball-outline" size={32} color="#7A7870" />
            <Text className="text-muted font-sans text-sm mt-3 text-center">
              No games yet.{'\n'}Join or host a game to get started.
            </Text>
          </View>
        ) : (
          recentGames.map((game) => <GameCard key={game.id} game={game} />)
        )}
      </View>

      {/* Log out */}
      <View className="px-4 pt-2">
        <Pressable
          onPress={handleLogout}
          className="rounded-xl py-4 items-center"
          style={{
            backgroundColor: 'rgba(239,68,68,0.12)',
            borderWidth: 1,
            borderColor: 'rgba(239,68,68,0.2)',
          }}
        >
          <Text className="font-sans font-semibold text-base" style={{ color: '#EF4444' }}>
            Log out
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
