import React, { useState, useRef } from 'react';
import { View, Text, Pressable } from 'react-native';
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
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: '#FF5C00',
          borderWidth: 2,
          borderColor: '#fff',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Emoji uses the system font — no custom font loading needed */}
        <Text style={{ fontSize: 12, lineHeight: 14 }}>🏀</Text>
      </View>

      <Callout tooltip={false}>
        <Pressable style={{ padding: 4, minWidth: 140 }} onPress={onCalloutPress}>
          <Text className="font-display text-base" style={{ color: '#111' }}>
            {court.name}
          </Text>
          <Text className="font-sans text-xs text-muted">{court.address}</Text>
          <Text className="font-sans text-xs text-orange mt-1">View court →</Text>
        </Pressable>
      </Callout>
    </Marker>
  );
}
