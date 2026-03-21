import React from 'react';
import { View, Text } from 'react-native';

export default function GamesScreen() {
  return (
    <View className="flex-1 bg-dark items-center justify-center">
      <Text className="text-cream font-display text-2xl">Games</Text>
      <Text className="text-muted font-sans text-sm mt-2">Coming soon</Text>
    </View>
  );
}
