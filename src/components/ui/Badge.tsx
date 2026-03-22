import React from 'react';
import { View, Text } from 'react-native';

export function Badge({ label, color }: { label: string; color: string }) {
  return (
    <View className="rounded-md px-2 py-[3px]" style={{ backgroundColor: color + '22' }}>
      <Text className="text-xs font-sans" style={{ color }}>
        {label}
      </Text>
    </View>
  );
}
