import React from 'react';
import { Animated, View } from 'react-native';
import { useShimmer } from '@/hooks/use-shimmer';

export default function CourtCardSkeleton() {
  const opacity = useShimmer();

  return (
    <Animated.View
      className="bg-surface rounded-xl p-3 flex-row gap-3"
      style={[{ opacity, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)' }]}
    >
      <View className="w-[72px] h-[72px] rounded-lg bg-skeleton" />
      <View className="flex-1 gap-2">
        <View className="h-3.5 rounded-md bg-skeleton" style={{ width: '70%' }} />
        <View className="rounded-md bg-skeleton" style={{ width: '45%', height: 10 }} />
        <View className="flex-row gap-1.5">
          <View className="w-[52px] h-5 rounded-full bg-skeleton" />
          <View className="w-[52px] h-5 rounded-full bg-skeleton" />
        </View>
      </View>
    </Animated.View>
  );
}
