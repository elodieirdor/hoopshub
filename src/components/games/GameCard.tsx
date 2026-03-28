import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
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
}

export function GameCard({ game }: GameCardProps) {
  const currentUserId = useAuthStore((s) => s.user?.id);

  const filled = game.game_players?.length ?? 0;
  const { label, color } = statusLabel(game);
  const hasJoined =
    !!currentUserId && (game.game_players ?? []).some((p) => p.player.id === currentUserId);

  return (
    <Pressable
      onPress={() => router.push(`/games/${game.id}`)}
      className="bg-surface border border-border rounded-xl p-4 mb-3"
      style={({ pressed }) =>
        pressed && { backgroundColor: '#202020', borderColor: 'rgba(255,255,255,0.14)' }
      }
    >
      {/* Host row */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2 flex-1">
          <Pressable
            className="flex-row items-center gap-2"
            onPress={() => router.push(`/users/${game.host_id}`)}
          >
            <View
              className="rounded-full items-center justify-center"
              style={{ width: 32, height: 32, backgroundColor: '#FF5C00' }}
            >
              <Text className="text-cream font-sans font-semibold text-xs">
                {initials(game.host?.name ?? '?')}
              </Text>
            </View>
            <Text className="text-muted font-sans text-xs">{game.host?.name ?? 'Unknown'}</Text>
          </Pressable>
          {game.court?.name ? (
            <Text className="text-muted font-sans text-xs flex-1" numberOfLines={1}>
              {' · '}
              {game.court.name}
            </Text>
          ) : null}
        </View>
        {/* Badges */}
        <View className="flex-row items-center gap-2">
          {hasJoined && (
            <View
              className="rounded-md px-2 py-[3px]"
              style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}
            >
              <Text className="text-xs font-sans" style={{ color: '#22C55E' }}>
                Joined
              </Text>
            </View>
          )}
          <View className="rounded-md px-2 py-[3px]" style={{ backgroundColor: color + '22' }}>
            <Text className="text-xs font-sans" style={{ color }}>
              {label}
            </Text>
          </View>
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
    </Pressable>
  );
}
