import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Game } from '@/types';

interface UpcomingGameCardProps {
  game: Game;
  isHost: boolean;
  onPress: () => void;
}

export function UpcomingGameCard({ game, isHost, onPress }: UpcomingGameCardProps) {
  const date = new Date(game.starts_at);
  const day = date.getDate();
  const month = date.toLocaleDateString('en-NZ', { month: 'short' });
  const weekday = date.toLocaleDateString('en-NZ', { weekday: 'short' });
  const time = date.toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit' });

  const filled = game.game_players?.length ?? 0;
  const total = game.max_players;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: 200,
        backgroundColor: pressed ? '#202020' : '#181818',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: pressed ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.08)',
        padding: 12,
        marginRight: 12,
        gap: 10,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      {/* Date block */}
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          backgroundColor: 'rgba(255,92,0,0.12)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: 'BebasNeue_400Regular',
            fontSize: 22,
            color: '#FF5C00',
            lineHeight: 24,
          }}
        >
          {day}
        </Text>
        <Text
          style={{
            fontFamily: 'DMSans_400Regular',
            fontSize: 11,
            color: '#7A7870',
            lineHeight: 13,
          }}
        >
          {month}
        </Text>
      </View>

      {/* Title */}
      <Text
        className="text-cream font-sans font-semibold text-sm"
        numberOfLines={2}
        style={{ lineHeight: 18 }}
      >
        {game.title}
      </Text>

      {/* Meta */}
      <View style={{ gap: 3, marginTop: 'auto' }}>
        <Text className="text-muted font-sans text-xs" numberOfLines={1}>
          {weekday} · {time}
        </Text>
        {game.court?.name ? (
          <Text className="text-muted font-sans text-xs" numberOfLines={1}>
            {game.court.name}
          </Text>
        ) : null}
        <View className="flex-row items-center justify-between mt-1">
          <Text className="text-muted font-sans text-xs">
            {filled}/{total} spots
          </Text>
          {isHost && (
            <View
              style={{
                backgroundColor: 'rgba(255,92,0,0.15)',
                borderRadius: 4,
                paddingHorizontal: 5,
                paddingVertical: 2,
              }}
            >
              <Text style={{ color: '#FF5C00', fontSize: 9, fontWeight: '600' }}>HOST</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
