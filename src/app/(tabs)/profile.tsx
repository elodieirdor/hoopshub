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
import { GameCard } from '@/components/games/GameCard';
import { GameCardSkeleton } from '@/components/games/GameCardSkeleton';
import { ProfileIdentity } from '@/components/profile/ProfileIdentity';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { ProfileRepSection } from '@/components/profile/ProfileRepSection';

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

  const avgRating = Number(user.avg_rating ?? 0);
  const repRatings = user.ratings ?? {
    punctuality: avgRating,
    sportsmanship: avgRating,
    skill_accuracy: avgRating,
    fun_to_play: avgRating,
  };

  return (
    <ScrollView
      className="flex-1 bg-dark"
      style={{ paddingTop: top }}
      contentContainerStyle={{ paddingBottom: bottom + 32 }}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#FF5C00" />
      }
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <Text className="font-display text-4xl text-cream">PROFILE</Text>
        <Pressable onPress={() => router.push('/profile/edit')} hitSlop={12}>
          <Text className="text-orange font-sans text-sm font-semibold">Edit</Text>
        </Pressable>
      </View>

      <ProfileIdentity user={user} />

      {/* Divider */}
      <View
        style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: 16 }}
      />

      <ProfileStats
        stats={[
          { value: user.games_played ?? 0, label: 'Games played' },
          {
            value: avgRating > 0 ? avgRating.toFixed(1) : '—',
            label: 'Avg rating',
            highlight: true,
          },
          { value: '—', label: 'Courts visited' },
        ]}
      />

      {/* Divider */}
      <View
        style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: 16 }}
      />

      <View className="px-4 pt-5 pb-4">
        <ProfileRepSection ratings={repRatings} />
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
