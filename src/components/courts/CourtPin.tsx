import React, { useState } from 'react';
import { View } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Text, Pressable } from '@/tw';
import { Court } from '@/types';

interface CourtPinProps {
  court: Court;
  onPress: () => void;
  onCalloutPress: () => void;
}

export function CourtPin({ court, onPress, onCalloutPress }: CourtPinProps) {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  return (
    <Marker
      coordinate={{ latitude: court.lat, longitude: court.lng }}
      tracksViewChanges={tracksViewChanges}
      onPress={onPress}
    >
      {/* RN View (not @/tw) — className not supported here */}
      <View
        onLayout={() => setTracksViewChanges(false)}
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
        <Ionicons name="basketball" size={14} color="#fff" />
      </View>

      <Callout tooltip={false}>
        <Pressable style={{ padding: 4, minWidth: 140 }} onPress={onCalloutPress}>
          <Text className="font-display text-base" style={{ color: '#111' }}>
            {court.name}
          </Text>
          <Text className="font-sans text-xs text-muted">
            {court.address}
          </Text>
          <Text className="font-sans text-xs text-orange mt-1">
            View court →
          </Text>
        </Pressable>
      </Callout>
    </Marker>
  );
}
