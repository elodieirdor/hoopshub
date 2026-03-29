import React from 'react';
import { Animated, ScrollView, View } from 'react-native';
import { useShimmer } from '@/hooks/use-shimmer';

export function CourtDetailSkeleton() {
  const opacity = useShimmer();

  return (
    <Animated.View className="flex-1 bg-dark" style={{ opacity }}>
      {/* Hero image */}
      <View style={{ height: 220, backgroundColor: '#181818' }} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        scrollEnabled={false}
      >
        <View className="px-4 pt-4">
          {/* Court name */}
          <View className="h-7 rounded-md bg-skeleton mb-2" style={{ width: '70%' }} />

          {/* Address */}
          <View className="flex-row items-center gap-1 mb-5">
            <View className="w-3.5 h-3.5 rounded bg-skeleton" />
            <View className="h-3 rounded-md bg-skeleton" style={{ width: 180 }} />
          </View>

          {/* Badges */}
          <View className="flex-row flex-wrap gap-2 mb-6">
            {[52, 72, 60, 48].map((w, i) => (
              <View key={i} className="h-5 rounded-full bg-skeleton" style={{ width: w }} />
            ))}
          </View>

          {/* Mini map placeholder */}
          <View className="rounded-xl mb-6 bg-skeleton" style={{ height: 140 }} />

          {/* Games heading */}
          <View className="h-5 rounded-md bg-skeleton mb-3" style={{ width: 100 }} />

          {/* Game card skeletons */}
          {[0, 1].map((i) => (
            <View
              key={i}
              className="rounded-xl p-4 mb-3"
              style={{
                backgroundColor: '#181818',
                borderWidth: 0.5,
                borderColor: 'rgba(255,255,255,0.08)',
              }}
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  <View className="w-8 h-8 rounded-full bg-skeleton" />
                  <View className="h-3 rounded-md bg-skeleton" style={{ width: 100 }} />
                </View>
                <View className="h-5 w-14 rounded-md bg-skeleton" />
              </View>
              <View className="h-3.5 rounded-md bg-skeleton mb-2" style={{ width: '60%' }} />
              <View className="h-2.5 rounded-md bg-skeleton" style={{ width: '40%' }} />
            </View>
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );
}
