import { Animated, StyleSheet, View } from 'react-native';
import { useShimmer } from '@/hooks/use-shimmer';

export default function MapSkeleton() {
  const opacity = useShimmer();
  return (
    <View className="bg-dark justify-center items-center" style={StyleSheet.absoluteFill}>
      <Animated.View className="items-center gap-2.5" style={{ opacity }}>
        <View className="w-9 h-9 rounded-full bg-skeleton" />
        <View className="w-[72px] h-2.5 rounded-md bg-skeleton" />
      </Animated.View>
    </View>
  );
}
