import React, { useState, useRef } from 'react';
import { View, Text } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { Court } from '@/types';

interface CourtPinProps {
  court: Court;
  onPress: () => void;
  onCalloutPress: () => void;
}

export function CourtPin({ court, onPress, onCalloutPress }: CourtPinProps) {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  return (
    <Marker
      coordinate={{ latitude: court.lat, longitude: court.lng }}
      tracksViewChanges={tracksViewChanges}
      onPress={onPress}
    >
      <View
        onLayout={() => {
          // Small delay so the view is fully painted before we stop tracking
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => setTracksViewChanges(false), 300);
        }}
        className="w-8 h-8 rounded-full bg-orange border-2 border-white items-center justify-center"
      >
        {/* Emoji uses the system font — no custom font loading needed */}
        <Text style={{ fontSize: 12, lineHeight: 14 }}>🏀</Text>
      </View>

      <Callout tooltip={false} onPress={onCalloutPress}>
        <View className="p-1 min-w-[140px]">
          <Text className="font-display text-base" style={{ color: '#111' }}>
            {court.name}
          </Text>
          <Text className="font-sans text-xs text-muted">{court.address}</Text>
          <Text className="font-sans text-xs text-orange mt-1">View court →</Text>
        </View>
      </Callout>
    </Marker>
  );
}
