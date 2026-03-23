import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Game } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { SkillTag } from './SkillTag';
import { PlayerSpots } from './PlayerSpots';
import { initials, formatDate, formatDuration } from '@/utils/formatters';

function statusLabel(game: Game): { label: string; color: string } {
  if (game.status === 'cancelled') return { label: 'Cancelled', color: '#7A7870' };
  if (game.status === 'completed') return { label: 'Completed', color: '#7A7870' };
  const filled = game.game_players?.length ?? 0;
  const ratio = game.max_players > 0 ? filled / game.max_players : 0;
  if (ratio >= 1) return { label: 'Full', color: '#EF4444' };
  if (ratio >= 0.7) return { label: 'Filling up', color: '#F59E0B' };
  return { label: 'Open', color: '#22C55E' };
}

interface GameCardProps {
  game: Game;
  onJoin?: (id: number) => void;
  onLeave?: (id: number) => void;
  joining?: boolean;
  leaving?: boolean;
}

export function GameCard({
  game,
  onJoin,
  onLeave,
  joining = false,
  leaving = false,
}: GameCardProps) {
  const router = useRouter();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const filled = game.game_players?.length ?? 0;
  const { label, color } = statusLabel(game);
  const isFull = game.status === 'full' || filled >= game.max_players;
  const isActive = game.status === 'open' || game.status === 'full';
  const hasJoined =
    !!currentUserId && (game.game_players ?? []).some((p) => p.player.id === currentUserId);
  const showJoin = isActive;

  return (
    <Pressable
      onPress={() => router.push(`/games/${game.id}`)}
      className="bg-surface border border-border rounded-xl p-4 mb-3"
    >
      {/* Host row */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2 flex-1">
          <View
            className="rounded-full items-center justify-center"
            style={{ width: 32, height: 32, backgroundColor: '#FF5C00' }}
          >
            <Text className="text-cream font-sans font-semibold text-xs">
              {initials(game.host?.name ?? '?')}
            </Text>
          </View>
          <Text className="text-muted font-sans text-xs flex-1" numberOfLines={1}>
            {game.host?.name ?? 'Unknown'} · {game.court?.name ?? ''}
          </Text>
        </View>
        {/* Status badge */}
        <View className="rounded-md px-2 py-[3px]" style={{ backgroundColor: color + '22' }}>
          <Text className="text-xs font-sans" style={{ color }}>
            {label}
          </Text>
        </View>
      </View>

      {/* Title */}
      <Text className="text-cream font-sans font-semibold text-base mb-3">{game.title}</Text>

      {/* Meta grid 2×2 */}
      <View className="flex-row flex-wrap gap-y-2 mb-3">
        <View className="flex-row items-center gap-1 w-1/2">
          <Ionicons name="calendar-outline" size={13} color="#7A7870" />
          <Text className="text-muted font-sans text-xs flex-1" numberOfLines={1}>
            {formatDate(game.starts_at)}
          </Text>
        </View>
        <View className="flex-row items-center gap-1 w-1/2">
          <Ionicons name="time-outline" size={13} color="#7A7870" />
          <Text className="text-muted font-sans text-xs">{formatDuration(game.duration_mins)}</Text>
        </View>
        <View className="flex-row items-center gap-1 w-1/2">
          <Ionicons name="location-outline" size={13} color="#7A7870" />
          <Text className="text-muted font-sans text-xs flex-1" numberOfLines={1}>
            {game.court?.address ?? ''}
          </Text>
        </View>
        <View className="flex-row items-center gap-1 w-1/2">
          <Ionicons name="basketball-outline" size={13} color="#7A7870" />
          <SkillTag level={game.skill_level} />
        </View>
      </View>

      {/* Spots bar */}
      <PlayerSpots filled={filled} total={game.max_players} />

      {/* Join / Leave button */}
      {showJoin &&
        (hasJoined ? (
          <Pressable
            onPress={() => !leaving && onLeave?.(game.id)}
            disabled={leaving}
            className="mt-3 rounded-lg py-2.5 items-center"
            style={{
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            {leaving ? (
              <ActivityIndicator size="small" color="#7A7870" />
            ) : (
              <Text className="font-sans font-semibold text-sm text-muted">Leave</Text>
            )}
          </Pressable>
        ) : onJoin ? (
          <Pressable
            onPress={() => !isFull && !joining && onJoin(game.id)}
            disabled={isFull || joining}
            className="mt-3 rounded-lg py-2.5 items-center"
            style={{ backgroundColor: isFull ? 'rgba(255,255,255,0.08)' : '#FF5C00' }}
          >
            {joining ? (
              <ActivityIndicator size="small" color="#F0EDE8" />
            ) : (
              <Text
                className="font-sans font-semibold text-sm"
                style={{ color: isFull ? '#7A7870' : '#F0EDE8' }}
              >
                {isFull ? 'Full' : 'Join'}
              </Text>
            )}
          </Pressable>
        ) : null)}
    </Pressable>
  );
}
