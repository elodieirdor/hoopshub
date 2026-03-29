import React from 'react';
import { Animated, ScrollView, View } from 'react-native';
import { useShimmer } from '@/hooks/use-shimmer';

const HERO_HEIGHT = 220;

export function GameDetailSkeleton() {
  const opacity = useShimmer();

  return (
    <Animated.View className="flex-1 bg-dark" style={{ opacity }}>
      {/* Hero */}
      <View style={{ height: HERO_HEIGHT, backgroundColor: '#181818' }} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        scrollEnabled={false}
      >
        <View className="px-4 pt-4">
          {/* Title */}
          <View className="h-7 rounded-md bg-skeleton mb-1" style={{ width: '75%' }} />
          <View className="h-7 rounded-md bg-skeleton mb-4" style={{ width: '50%' }} />

          {/* Host row */}
          <View className="flex-row items-center gap-2 mb-5">
            <View className="w-9 h-9 rounded-full bg-skeleton" />
            <View className="gap-1.5">
              <View className="h-2.5 rounded-md bg-skeleton" style={{ width: 60 }} />
              <View className="h-3.5 rounded-md bg-skeleton" style={{ width: 120 }} />
            </View>
          </View>

          {/* Info card */}
          <View
            className="rounded-xl mb-5"
            style={{
              backgroundColor: '#181818',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            {[0, 1, 2, 3].map((i) => (
              <React.Fragment key={i}>
                {i > 0 && <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />}
                <View className="flex-row items-center gap-3 px-4 py-3">
                  <View className="w-[18px] h-[18px] rounded-md bg-skeleton" />
                  <View className="h-3 rounded-md bg-skeleton flex-1" style={{ maxWidth: 80 }} />
                  <View className="h-3 rounded-md bg-skeleton" style={{ width: 100 }} />
                </View>
              </React.Fragment>
            ))}
          </View>

          {/* Players heading */}
          <View className="h-5 rounded-md bg-skeleton mb-3" style={{ width: 140 }} />

          {/* Player rows */}
          <View
            className="rounded-xl mb-5"
            style={{
              backgroundColor: '#181818',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            {[0, 1, 2].map((i) => (
              <React.Fragment key={i}>
                {i > 0 && <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />}
                <View className="flex-row items-center gap-3 px-4 py-3">
                  <View className="w-8 h-8 rounded-full bg-skeleton" />
                  <View className="h-3.5 rounded-md bg-skeleton" style={{ width: 130 }} />
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
}
