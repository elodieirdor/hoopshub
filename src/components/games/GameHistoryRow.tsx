import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Game } from '@/types';
import { formatDate } from '@/utils/formatters';

export function GameHistoryRow({ game }: { game: Game }) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/games/${game.id}`)}
      className="flex-row items-center py-3"
      style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' }}
    >
      <View className="flex-1">
        <Text className="text-cream font-sans font-semibold text-sm" numberOfLines={1}>
          {game.title}
        </Text>
        <Text className="text-muted font-sans text-xs mt-0.5">{formatDate(game.starts_at)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#7A7870" />
    </Pressable>
  );
}
