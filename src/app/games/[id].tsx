import React from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, Image } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGame, joinGame, leaveGame, updateGame } from '@/api/games';
import { useAuthStore } from '@/store/authStore';
import { BasketballCourtSVG } from '@/components/games/BasketballCourtSVG';
import { initials, formatDate, formatDuration, SKILL_COLORS } from '@/utils/formatters';

const HERO_HEIGHT = 220;

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);

  const {
    data: game,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['game', id],
    queryFn: () => getGame(Number(id)),
    enabled: !!id,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['game', id] });

  const joinMutation = useMutation({
    mutationFn: () => joinGame(game!.id),
    onSuccess: invalidate,
    onError: () => Alert.alert('Error', 'Could not join game. Please try again.'),
  });

  const leaveMutation = useMutation({
    mutationFn: () => leaveGame(game!.id),
    onSuccess: invalidate,
    onError: () => Alert.alert('Error', 'Could not leave game. Please try again.'),
  });

  const cancelMutation = useMutation({
    mutationFn: () => updateGame(game!.id, { status: 'cancelled' }),
    onSuccess: () => router.back(),
    onError: () => Alert.alert('Error', 'Could not cancel game. Please try again.'),
  });

  if (loading) {
    return (
      <View className="flex-1 bg-dark justify-center items-center">
        <ActivityIndicator color="#FF5C00" />
      </View>
    );
  }

  if (error || !game) {
    return (
      <View className="flex-1 bg-dark justify-center items-center px-8">
        <Text className="text-muted font-sans text-center">
          {error ? 'Failed to load game' : 'Game not found'}
        </Text>
      </View>
    );
  }

  const confirmedPlayers = game.game_players ?? [];
  const filled = confirmedPlayers.length;
  const emptySlots = Math.max(0, game.max_players - filled);
  const isHost = currentUser?.id === game.host_id;
  const hasJoined = !isHost && confirmedPlayers.some((p) => p.player_id === currentUser?.id);
  const isActive = game.status === 'open' || game.status === 'full';
  const isFull = filled >= game.max_players || game.status === 'full';
  const actionLoading =
    joinMutation.isPending || leaveMutation.isPending || cancelMutation.isPending;
  const skillColor = SKILL_COLORS[game.skill_level] ?? '#7A7870';

  const handleLeave = () => {
    Alert.alert('Leave game', 'Are you sure you want to leave this game?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: () => leaveMutation.mutate() },
    ]);
  };

  const handleCancel = () => {
    Alert.alert('Cancel game', 'Are you sure you want to cancel this game?', [
      { text: 'Keep it', style: 'cancel' },
      { text: 'Cancel game', style: 'destructive', onPress: () => cancelMutation.mutate() },
    ]);
  };

  return (
    <View className="flex-1 bg-dark">
      <Stack.Screen
        options={{
          title: game.title,
          headerBackTitle: 'Back',
          headerRight:
            isHost && isActive
              ? () => (
                  <Pressable onPress={() => router.push(`/games/edit?id=${game.id}`)} hitSlop={12}>
                    <Ionicons name="create-outline" size={22} color="#F0EDE8" />
                  </Pressable>
                )
              : undefined,
        }}
      />

      {/* Hero */}
      <View style={{ height: HERO_HEIGHT }}>
        {game.court?.images && game.court.images.length > 0 ? (
          <Image
            source={{ uri: game.court.images[0] }}
            style={{ width: '100%', height: HERO_HEIGHT }}
            resizeMode="cover"
          />
        ) : (
          <BasketballCourtSVG height={HERO_HEIGHT} />
        )}
        <View
          style={{
            position: 'absolute',
            bottom: 12,
            left: 16,
            flexDirection: 'row',
            gap: 6,
          }}
        >
          <View
            style={{
              backgroundColor: 'rgba(0,0,0,0.6)',
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 3,
            }}
          >
            <Text style={{ color: '#F0EDE8', fontFamily: 'DMSans', fontSize: 12 }}>
              {game.game_type.toUpperCase()}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: skillColor + 'CC',
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 3,
            }}
          >
            <Text style={{ color: '#F0EDE8', fontFamily: 'DMSans', fontSize: 12 }}>
              {game.skill_level.toUpperCase()}
            </Text>
          </View>
          {(game.status === 'cancelled' || game.status === 'completed') && (
            <View
              style={{
                backgroundColor: 'rgba(0,0,0,0.6)',
                borderRadius: 6,
                paddingHorizontal: 8,
                paddingVertical: 3,
              }}
            >
              <Text style={{ color: '#7A7870', fontFamily: 'DMSans', fontSize: 12 }}>
                {game.status.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="px-4 pt-4">
          {/* Title */}
          <Text className="font-display text-4xl text-cream mb-3" numberOfLines={2}>
            {game.title}
          </Text>

          {/* Host row */}
          <View className="flex-row items-center gap-2 mb-5">
            <View
              className="rounded-full items-center justify-center"
              style={{ width: 36, height: 36, backgroundColor: '#FF5C00' }}
            >
              <Text className="text-cream font-sans font-semibold text-xs">
                {initials(game.host?.name ?? '?')}
              </Text>
            </View>
            <View>
              <Text className="text-muted font-sans text-xs">Hosted by</Text>
              <Text className="text-cream font-sans text-sm font-semibold">
                {game.host?.name ?? 'Unknown'}
                {game.host?.avg_rating ? (
                  <Text className="text-muted font-sans text-xs">
                    {' '}
                    · ★ {Number(game.host.avg_rating).toFixed(1)}
                  </Text>
                ) : null}
              </Text>
            </View>
          </View>

          {/* Info list */}
          <View
            className="rounded-xl mb-5"
            style={{
              backgroundColor: '#181818',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            <View className="flex-row items-center gap-3 px-4 py-3">
              <Ionicons name="calendar-outline" size={18} color="#FF5C00" />
              <Text className="text-muted font-sans text-sm flex-1">Date & Time</Text>
              <Text className="text-cream font-sans text-sm font-semibold">
                {formatDate(game.starts_at)}
              </Text>
            </View>
            <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
            <View className="flex-row items-center gap-3 px-4 py-3">
              <Ionicons name="time-outline" size={18} color="#FF5C00" />
              <Text className="text-muted font-sans text-sm flex-1">Duration</Text>
              <Text className="text-cream font-sans text-sm font-semibold">
                {formatDuration(game.duration_mins)}
              </Text>
            </View>
            <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
            <Pressable
              className="flex-row items-center gap-3 px-4 py-3"
              onPress={() => router.push(`/courts/${game.court_id}`)}
            >
              <Ionicons name="location-outline" size={18} color="#FF5C00" />
              <Text className="text-muted font-sans text-sm flex-1">Location</Text>
              <Text className="text-orange font-sans text-sm font-semibold" numberOfLines={1}>
                {game.court?.name ?? '—'}
              </Text>
            </Pressable>
            <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
            <View className="flex-row items-center gap-3 px-4 py-3">
              <Ionicons name="basketball-outline" size={18} color="#FF5C00" />
              <Text className="text-muted font-sans text-sm flex-1">Skill level</Text>
              <Text className="font-sans text-sm font-semibold" style={{ color: skillColor }}>
                {game.skill_level.charAt(0).toUpperCase() + game.skill_level.slice(1)}
              </Text>
            </View>
          </View>

          {/* Players section */}
          <Text className="font-display text-2xl text-cream mb-3">
            Players ({filled}/{game.max_players})
          </Text>
          <View
            className="rounded-xl mb-5"
            style={{
              backgroundColor: '#181818',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            {confirmedPlayers.map((gp, i) => (
              <View key={gp.id}>
                {i > 0 && <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />}
                <View className="flex-row items-center gap-3 px-4 py-3">
                  <View
                    className="rounded-full items-center justify-center"
                    style={{ width: 36, height: 36, backgroundColor: '#FF5C00' }}
                  >
                    <Text className="text-cream font-sans font-semibold text-xs">
                      {initials(gp.player?.name ?? '?')}
                    </Text>
                  </View>
                  <Text className="text-cream font-sans text-sm font-semibold flex-1">
                    {gp.player?.name ?? 'Unknown'}
                  </Text>
                  {gp.player_id === game.host_id && (
                    <Text className="text-orange font-sans text-xs">Host</Text>
                  )}
                </View>
              </View>
            ))}
            {Array.from({ length: emptySlots }).map((_, i) => (
              <View key={`empty-${i}`}>
                {(i > 0 || confirmedPlayers.length > 0) && (
                  <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
                )}
                <View className="flex-row items-center gap-3 px-4 py-3">
                  <View
                    className="rounded-full items-center justify-center"
                    style={{
                      width: 36,
                      height: 36,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.12)',
                    }}
                  />
                  <Text className="text-muted font-sans text-sm">Open spot</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Description */}
          {game.description ? (
            <View>
              <Text className="font-display text-2xl text-cream mb-2">About</Text>
              <Text className="text-muted font-sans text-sm leading-5">{game.description}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Bottom action bar */}
      <View
        className="px-4 pt-3 pb-8"
        style={{
          backgroundColor: '#0A0A0A',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.08)',
        }}
      >
        {isHost ? (
          game.status === 'cancelled' ? (
            <View className="rounded-xl py-4 items-center" style={{ backgroundColor: '#181818' }}>
              <Text className="font-sans font-semibold text-base text-muted">Game cancelled</Text>
            </View>
          ) : (
            <Pressable
              onPress={handleCancel}
              disabled={actionLoading}
              className="rounded-xl py-4 items-center"
              style={{ backgroundColor: '#EF444422' }}
            >
              {cancelMutation.isPending ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Text className="font-sans font-semibold text-base" style={{ color: '#EF4444' }}>
                  Cancel game
                </Text>
              )}
            </Pressable>
          )
        ) : !isActive ? (
          <View className="rounded-xl py-4 items-center" style={{ backgroundColor: '#181818' }}>
            <Text className="font-sans font-semibold text-base text-muted">
              {game.status === 'completed' ? 'Game completed' : 'Game cancelled'}
            </Text>
          </View>
        ) : hasJoined ? (
          <Pressable
            onPress={handleLeave}
            disabled={actionLoading}
            className="rounded-xl py-4 items-center"
            style={{
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            {leaveMutation.isPending ? (
              <ActivityIndicator size="small" color="#7A7870" />
            ) : (
              <Text className="font-sans font-semibold text-base text-muted">Leave game</Text>
            )}
          </Pressable>
        ) : (
          <Pressable
            onPress={isFull ? undefined : () => joinMutation.mutate()}
            disabled={isFull || actionLoading}
            className="rounded-xl py-4 items-center"
            style={{ backgroundColor: isFull ? 'rgba(255,255,255,0.08)' : '#FF5C00' }}
          >
            {joinMutation.isPending ? (
              <ActivityIndicator size="small" color="#F0EDE8" />
            ) : (
              <Text
                className="font-sans font-semibold text-base"
                style={{ color: isFull ? '#7A7870' : '#F0EDE8' }}
              >
                {isFull ? 'Game full' : 'Join game'}
              </Text>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}
