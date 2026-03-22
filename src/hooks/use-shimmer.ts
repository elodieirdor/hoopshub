import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export function useShimmer() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
    ).start();
  }, [anim]);
  return anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });
}
