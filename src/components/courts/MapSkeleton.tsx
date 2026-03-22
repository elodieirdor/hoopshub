import { Animated, StyleSheet, View } from 'react-native';
import { useShimmer } from '@/hooks/use-shimmer';

export default function MapSkeleton() {
  const opacity = useShimmer();
  return (
    <View
      style={{
        ...StyleSheet.absoluteFill,
        backgroundColor: '#0A0A0A',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Animated.View style={{ alignItems: 'center', gap: 10, opacity }}>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#2a2a2a' }} />
        <View style={{ width: 72, height: 10, borderRadius: 5, backgroundColor: '#2a2a2a' }} />
      </Animated.View>
    </View>
  );
}
