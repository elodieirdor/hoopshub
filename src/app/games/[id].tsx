import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, Image } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getGame, joinGame, leaveGame, updateGame } from '@/api/games';
import { Game } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { BasketballCourtSVG } from '@/components/games/BasketballCourtSVG';

const HERO_HEIGHT = 220;
import { initials, formatDate, formatDuration } from '@/utils/formatters';

const SKILL_COLORS: Record<Game['skill_level'], string> = {
  beginner: '#3B82F6',
  intermediate: '#FF5C00',
  advanced: '#F59E0B',
  comp: '#EF4444',
  any: '#22C55E',
};

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);

  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchGame = useCallback(async () => {
    try {
      setError(null);
      const data = await getGame(Number(id));
      setGame(data);
    } catch {
      setError('Failed to load game');
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    fetchGame().finally(() => setLoading(false));
  }, [fetchGame]);

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
        <Text className="text-muted font-sans text-center">{error ?? 'Game not found'}</Text>
      </View>
    );
  }

  const confirmedPlayers = game.game_players ?? [];
  console.log('confirmedPlayers', confirmedPlayers);
  const filled = confirmedPlayers.length;
  const emptySlots = Math.max(0, game.max_players - filled);
  const isHost = currentUser?.id === game.host_id;
  const hasJoined = !isHost && confirmedPlayers.some((p) => p.player_id === currentUser?.id);
  console.log(hasJoined);
  console.log(currentUser);
  const isActive = game.status === 'open' || game.status === 'full';
  const isFull = filled >= game.max_players || game.status === 'full';

  const handleJoin = async () => {
    setActionLoading(true);
    try {
      await joinGame(game.id);
      await fetchGame();
    } catch {
      Alert.alert('Error', 'Could not join game. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = () => {
    Alert.alert('Leave game', 'Are you sure you want to leave this game?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          try {
            await leaveGame(game.id);
            await fetchGame();
          } catch {
            Alert.alert('Error', 'Could not leave game. Please try again.');
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleCancel = () => {
    Alert.alert('Cancel game', 'Are you sure you want to cancel this game?', [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Cancel game',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          try {
            await updateGame(game.id, { status: 'cancelled' });
            router.back();
          } catch {
            Alert.alert('Error', 'Could not cancel game. Please try again.');
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const skillColor = SKILL_COLORS[game.skill_level] ?? '#7A7870';

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
        {/* Overlay: game type + skill level */}
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

          {/* Info list — 4 rows */}
          <View
            className="rounded-xl mb-5"
            style={{
              backgroundColor: '#181818',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            {/* Date & Time */}
            <View className="flex-row items-center gap-3 px-4 py-3">
              <Ionicons name="calendar-outline" size={18} color="#FF5C00" />
              <Text className="text-muted font-sans text-sm flex-1">Date & Time</Text>
              <Text className="text-cream font-sans text-sm font-semibold">
                {formatDate(game.starts_at)}
              </Text>
            </View>
            <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
            {/* Duration */}
            <View className="flex-row items-center gap-3 px-4 py-3">
              <Ionicons name="time-outline" size={18} color="#FF5C00" />
              <Text className="text-muted font-sans text-sm flex-1">Duration</Text>
              <Text className="text-cream font-sans text-sm font-semibold">
                {formatDuration(game.duration_mins)}
              </Text>
            </View>
            <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
            {/* Location */}
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
            {/* Skill level */}
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
              {actionLoading ? (
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
            {actionLoading ? (
              <ActivityIndicator size="small" color="#7A7870" />
            ) : (
              <Text className="font-sans font-semibold text-base text-muted">Leave game</Text>
            )}
          </Pressable>
        ) : (
          <Pressable
            onPress={isFull ? undefined : handleJoin}
            disabled={isFull || actionLoading}
            className="rounded-xl py-4 items-center"
            style={{ backgroundColor: isFull ? 'rgba(255,255,255,0.08)' : '#FF5C00' }}
          >
            {actionLoading ? (
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
