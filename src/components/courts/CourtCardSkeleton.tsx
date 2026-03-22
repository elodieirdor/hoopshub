import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useShimmer } from '@/hooks/use-shimmer';

export default function CourtCardSkeleton() {
  const opacity = useShimmer();

  return (
    <Animated.View style={[styles.skeletonCard, { opacity }]}>
      <View style={styles.skeletonThumb} />
      <View style={{ flex: 1, gap: 8 }}>
        <View style={[styles.skeletonLine, { width: '70%' }]} />
        <View style={[styles.skeletonLine, { width: '45%', height: 10 }]} />
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <View style={styles.skeletonBadge} />
          <View style={styles.skeletonBadge} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  skeletonCard: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  skeletonThumb: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
  },
  skeletonLine: {
    height: 14,
    borderRadius: 6,
    backgroundColor: '#2a2a2a',
  },
  skeletonBadge: {
    width: 52,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2a2a2a',
  },
});
