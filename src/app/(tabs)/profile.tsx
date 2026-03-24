import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { getGames } from '@/api/games';
import { GameHistoryRow } from '@/components/games/GameHistoryRow';
import { ProfileIdentity } from '@/components/profile/ProfileIdentity';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { ProfileRepSection } from '@/components/profile/ProfileRepSection';

export default function ProfileScreen() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const [menuOpen, setMenuOpen] = useState(false);

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

  const closeMenu = () => setMenuOpen(false);

  return (
    <View className="flex-1 bg-dark" style={{ paddingTop: top }}>
      {/* Fixed header */}
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <Text className="font-display text-4xl text-cream">PROFILE</Text>
        <Pressable onPress={() => setMenuOpen(true)} hitSlop={12}>
          <Ionicons name="ellipsis-vertical" size={20} color="#F0EDE8" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: bottom + 32 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#FF5C00" />
        }
      >
        <ProfileIdentity user={user} />

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

        <View
          style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: 16 }}
        />

        <View className="px-4 pt-5 pb-4">
          <ProfileRepSection ratings={repRatings} />
        </View>

        <View className="px-4 pt-2 pb-6">
          <Text className="font-display text-2xl text-cream mb-4">RECENT GAMES</Text>
          {isLoading ? (
            <ActivityIndicator color="#FF5C00" style={{ marginTop: 8 }} />
          ) : recentGames.length === 0 ? (
            <View className="items-center py-8">
              <Ionicons name="basketball-outline" size={32} color="#7A7870" />
              <Text className="text-muted font-sans text-sm mt-3 text-center">
                No games yet.{'\n'}Join or host a game to get started.
              </Text>
            </View>
          ) : (
            recentGames.map((game) => <GameHistoryRow key={game.id} game={game} />)
          )}
        </View>
      </ScrollView>

      {/* Dropdown menu */}
      {menuOpen && (
        <>
          <Pressable
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            onPress={closeMenu}
          />
          <View
            style={{
              position: 'absolute',
              top: top + 52,
              right: 16,
              zIndex: 100,
              backgroundColor: '#202020',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.10)',
              minWidth: 180,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Pressable
              onPress={() => {
                closeMenu();
                router.push('/profile/edit');
              }}
              className="flex-row items-center gap-3 px-4 py-3"
            >
              <Ionicons name="pencil-outline" size={17} color="#F0EDE8" />
              <Text className="text-cream font-sans text-sm">Edit profile</Text>
            </Pressable>
            <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
            <Pressable
              onPress={() => {
                closeMenu();
                router.push('/profile/settings');
              }}
              className="flex-row items-center gap-3 px-4 py-3"
            >
              <Ionicons name="settings-outline" size={17} color="#F0EDE8" />
              <Text className="text-cream font-sans text-sm">Settings</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}
