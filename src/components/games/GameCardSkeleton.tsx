import React from 'react';
import { Animated, View } from 'react-native';
import { useShimmer } from '@/hooks/use-shimmer';

export function GameCardSkeleton() {
  const opacity = useShimmer();

  return (
    <Animated.View
      className="bg-surface rounded-xl p-4 mb-3"
      style={[{ opacity, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)' }]}
    >
      {/* Host row */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-full bg-skeleton" />
          <View className="h-3 rounded-md bg-skeleton" style={{ width: 120 }} />
        </View>
        <View className="h-5 w-16 rounded-md bg-skeleton" />
      </View>

      {/* Title */}
      <View className="h-4 rounded-md bg-skeleton mb-3" style={{ width: '65%' }} />

      {/* Meta grid 2×2 */}
      <View className="flex-row flex-wrap gap-y-2 mb-3">
        <View className="h-3 rounded-md bg-skeleton w-1/2" style={{ width: '45%' }} />
        <View className="h-3 rounded-md bg-skeleton" style={{ width: '30%' }} />
        <View className="h-3 rounded-md bg-skeleton" style={{ width: '40%' }} />
        <View className="h-5 rounded-md bg-skeleton" style={{ width: '25%' }} />
      </View>

      {/* Spots bar */}
      <View className="h-1.5 rounded-full bg-skeleton mb-1.5" />
      <View className="h-3 rounded-md bg-skeleton" style={{ width: '25%' }} />
    </Animated.View>
  );
}
