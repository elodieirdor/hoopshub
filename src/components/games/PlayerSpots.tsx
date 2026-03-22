import React from 'react';
import { View, Text } from 'react-native';

function spotColor(filled: number, total: number): string {
  const ratio = total > 0 ? filled / total : 0;
  if (ratio >= 1) return '#EF4444';
  if (ratio >= 0.7) return '#F59E0B';
  return '#22C55E';
}

export function PlayerSpots({ filled, total }: { filled: number; total: number }) {
  const ratio = total > 0 ? Math.min(filled / total, 1) : 0;
  const color = spotColor(filled, total);

  return (
    <View className="gap-1.5">
      <View
        className="h-1.5 rounded-full w-full"
        style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
      >
        <View
          className="h-1.5 rounded-full"
          style={{ width: `${ratio * 100}%`, backgroundColor: color }}
        />
      </View>
      <Text className="text-xs font-sans text-muted">
        {filled}/{total} players
      </Text>
    </View>
  );
}
