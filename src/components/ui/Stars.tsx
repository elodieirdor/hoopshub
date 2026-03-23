import React from 'react';
import { View, Text } from 'react-native';

export function Stars({ rating }: { rating: number }) {
  return (
    <View className="flex-row gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Text
          key={i}
          style={{ color: i < Math.round(rating) ? '#FF5C00' : '#7A7870', fontSize: 14 }}
        >
          {i < Math.round(rating) ? '★' : '☆'}
        </Text>
      ))}
    </View>
  );
}
