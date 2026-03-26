import React from 'react';
import { View, Text, ScrollView, Pressable, Share, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ErrorState } from '@/components/ui/ErrorState';
import { ProfileIdentity } from '@/components/profile/ProfileIdentity';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { ProfileRepSection } from '@/components/profile/ProfileRepSection';
import { SKILL_COLORS, formatDate } from '@/utils/formatters';
import { Badge } from '@/components/ui/Badge';
import { userQueries } from '@/api/queries';

const AVATAR_PALETTE = ['#3B82F6', '#22C55E', '#F59E0B', '#8B5CF6', '#06B6D4', '#EF4444'];

function avatarBgColor(name: string): string {
  return AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length];
}

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { top } = useSafeAreaInsets();

  const { data: profile, isLoading, error, refetch } = useQuery(userQueries.detail(id!));

  const handleShare = async () => {
    if (!profile) return;
    await Share.share({
      message: `Check out ${profile.name} on Hoops Hub!`,
      url: `https://hoopshub.co.nz/users/${id}`,
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-dark justify-center items-center">
        <ActivityIndicator color="#FF5C00" />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View className="flex-1 bg-dark">
        <ErrorState message="Failed to load profile" onRetry={refetch} />
      </View>
    );
  }

  const avgRating = Number(profile.avg_rating ?? 0);

  return (
    <View className="flex-1 bg-dark" style={{ paddingTop: top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color="#F0EDE8" />
        </Pressable>
        <Pressable onPress={handleShare} hitSlop={12}>
          <Ionicons name="share-outline" size={24} color="#F0EDE8" />
        </Pressable>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        <ProfileIdentity
          user={profile}
          avatarBgColor={avatarBgColor(profile.name)}
          avatarSize={80}
          avatarBorder
        />

        <View className="px-4">
          {/* Stats */}
          <View
            className="rounded-xl mb-3"
            style={{
              backgroundColor: '#181818',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            <ProfileStats
              stats={[
                { value: profile.games_played ?? 0, label: 'Games played' },
                {
                  value: avgRating > 0 ? avgRating.toFixed(1) : '—',
                  label: 'Avg rating',
                  highlight: true,
                },
                { value: profile.hosted_count ?? 0, label: 'Hosted' },
              ]}
            />
          </View>

          {/* Community rep */}
          {profile.ratings && (
            <View className="mb-3">
              <ProfileRepSection ratings={profile.ratings} showValue />
            </View>
          )}

          {/* Recent games */}
          <View
            className="rounded-xl mb-3"
            style={{
              backgroundColor: '#181818',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            <Text className="font-display text-xl text-cream px-4 pt-4 pb-3">RECENT GAMES</Text>
            {!profile.recent_games?.length ? (
              <View className="px-4 pb-4">
                <Text className="text-muted font-sans text-sm">No games played yet</Text>
              </View>
            ) : (
              profile.recent_games.map((game) => (
                <View key={game.id}>
                  <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
                  <Pressable className="px-4 py-3" onPress={() => router.push(`/games/${game.id}`)}>
                    <Text className="text-cream font-sans font-semibold text-sm mb-1">
                      {game.title}
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-muted font-sans text-xs flex-1" numberOfLines={1}>
                        {game.court?.name} · {formatDate(game.starts_at)}
                      </Text>
                      <Badge
                        label={game.skill_level}
                        color={SKILL_COLORS[game.skill_level] ?? '#7A7870'}
                      />
                    </View>
                  </Pressable>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
