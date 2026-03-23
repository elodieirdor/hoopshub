import React from 'react';
import { View, Text, ScrollView, Pressable, Share, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getPublicProfile } from '@/api/profiles';
import { Badge } from '@/components/ui/Badge';
import { SKILL_COLORS, initials, formatDate } from '@/utils/formatters';

const AVATAR_PALETTE = ['#3B82F6', '#22C55E', '#F59E0B', '#8B5CF6', '#06B6D4', '#EF4444'];

function avatarBgColor(name: string): string {
  return AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      {Array.from({ length: 5 }, (_, i) => {
        const filled = rating >= i + 1;
        const half = !filled && rating >= i + 0.5;
        return (
          <Ionicons
            key={i}
            name={filled ? 'star' : half ? 'star-half' : 'star-outline'}
            size={14}
            color={filled || half ? '#FF5C00' : '#444441'}
          />
        );
      })}
      <Text className="text-muted font-sans text-xs" style={{ marginLeft: 4 }}>
        {rating.toFixed(1)}
      </Text>
    </View>
  );
}

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { top } = useSafeAreaInsets();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => getPublicProfile(Number(id)),
    enabled: !!id,
  });

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
      <View className="flex-1 bg-dark justify-center items-center px-8">
        <Text className="text-muted font-sans text-center">Failed to load profile</Text>
      </View>
    );
  }

  const skillColor = SKILL_COLORS[profile.skill_level] ?? '#7A7870';
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
        {/* Hero */}
        <View className="items-center px-4 pt-4 pb-6">
          <View
            className="rounded-full items-center justify-center mb-4"
            style={{
              width: 80,
              height: 80,
              backgroundColor: avatarBgColor(profile.name),
              borderWidth: 2,
              borderColor: '#FF5C00',
            }}
          >
            <Text style={{ color: '#fff', fontFamily: 'DMSans_600SemiBold', fontSize: 28 }}>
              {initials(profile.name)}
            </Text>
          </View>

          <Text className="font-display text-cream mb-1" style={{ fontSize: 28 }}>
            {profile.name.toUpperCase()}
          </Text>

          <Text className="text-muted font-sans mb-3" style={{ fontSize: 13 }}>
            @{profile.username}
            {profile.city ? ` · ${profile.city}` : ''}
          </Text>

          <View className="flex-row gap-2 mb-2">
            <Badge
              label={profile.skill_level.charAt(0).toUpperCase() + profile.skill_level.slice(1)}
              color={skillColor}
            />
            {profile.position && profile.position !== 'Any' && (
              <Badge label={profile.position} color="#7A7870" />
            )}
          </View>

          {profile.member_since && (
            <Text className="text-muted font-sans" style={{ fontSize: 12 }}>
              Member since {profile.member_since}
            </Text>
          )}
        </View>

        <View className="px-4">
          {/* Stats row */}
          <View
            className="rounded-xl mb-3 flex-row"
            style={{
              backgroundColor: '#181818',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            <View className="flex-1 items-center py-4">
              <Text className="font-display text-3xl text-cream">{profile.games_played ?? 0}</Text>
              <Text className="text-muted font-sans text-xs mt-0.5">Games played</Text>
            </View>
            <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
            <View className="flex-1 items-center py-4">
              <Text className="font-display text-3xl" style={{ color: '#FF5C00' }}>
                {avgRating > 0 ? avgRating.toFixed(1) : '—'}
              </Text>
              <Text className="text-muted font-sans text-xs mt-0.5">Avg rating</Text>
            </View>
            <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
            <View className="flex-1 items-center py-4">
              <Text className="font-display text-3xl text-cream">
                {profile.hosted_count ?? 0}
              </Text>
              <Text className="text-muted font-sans text-xs mt-0.5">Hosted</Text>
            </View>
          </View>

          {/* Community rep */}
          {profile.ratings && (
            <View
              className="rounded-xl mb-3"
              style={{
                backgroundColor: '#181818',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.08)',
              }}
            >
              <Text className="font-display text-cream px-4 pt-4 pb-3" style={{ fontSize: 18 }}>
                COMMUNITY REP
              </Text>
              {[
                { label: 'Shows up on time', value: profile.ratings.punctuality },
                { label: 'Good sportsmanship', value: profile.ratings.sportsmanship },
                { label: 'Right skill level', value: profile.ratings.skill_accuracy },
                { label: 'Fun to play with', value: profile.ratings.fun_to_play },
              ].map((row) => (
                <View key={row.label}>
                  <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
                  <View className="flex-row items-center justify-between px-4 py-3">
                    <Text className="text-cream font-sans text-sm flex-1">{row.label}</Text>
                    {row.value > 0 ? (
                      <StarRating rating={row.value} />
                    ) : (
                      <Text className="text-muted font-sans text-xs">No ratings yet</Text>
                    )}
                  </View>
                </View>
              ))}
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
            <Text className="font-display text-cream px-4 pt-4 pb-3" style={{ fontSize: 18 }}>
              RECENT GAMES
            </Text>
            {!profile.recent_games?.length ? (
              <View className="px-4 pb-4">
                <Text className="text-muted font-sans text-sm">No games played yet</Text>
              </View>
            ) : (
              profile.recent_games.map((game) => (
                <View key={game.id}>
                  <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
                  <Pressable
                    className="px-4 py-3"
                    onPress={() => router.push(`/games/${game.id}`)}
                  >
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
