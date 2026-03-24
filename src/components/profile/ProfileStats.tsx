import React from 'react';
import { View, Text } from 'react-native';

export interface Stat {
  value: string | number;
  label: string;
  highlight?: boolean;
}

export function ProfileStats({ stats }: { stats: Stat[] }) {
  return (
    <View className="flex-row">
      {stats.map((stat, i) => (
        <React.Fragment key={stat.label}>
          {i > 0 && <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />}
          <View className="flex-1 items-center py-4">
            <Text
              className="font-display text-3xl"
              style={{ color: stat.highlight ? '#FF5C00' : '#F0EDE8' }}
            >
              {stat.value}
            </Text>
            <Text className="text-muted font-sans text-xs mt-0.5">{stat.label}</Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}
