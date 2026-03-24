import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  rating: number;
  showValue?: boolean;
}

export function Stars({ rating, showValue = false }: Props) {
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
      {showValue && (
        <Text className="text-muted font-sans text-xs" style={{ marginLeft: 4 }}>
          {rating.toFixed(1)}
        </Text>
      )}
    </View>
  );
}
