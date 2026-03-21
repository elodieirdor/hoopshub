import React from 'react';
import { View, Text, Pressable } from '@/tw';
import { Ionicons } from '@expo/vector-icons';
import { Court } from '@/types';
import CourtIcon from './CourtIcon';
import { formatDistance } from '@/utils/geo';

interface CourtCardProps {
  court: Court;
  onPress: () => void;
  distance?: number;
  highlighted?: boolean;
}

interface BadgeProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  bg: string;
  color: string;
}

function Badge({ label, icon, bg, color }: BadgeProps) {
  return (
    <View
      className="flex-row items-center gap-1 px-2 py-1 rounded-lg"
      style={{ backgroundColor: bg }}
    >
      <Ionicons name={icon} size={11} color={color} />
      <Text className="font-sans" style={{ color, fontSize: 11, fontWeight: '600' }}>
        {label}
      </Text>
    </View>
  );
}

export function CourtCard({ court, onPress, distance, highlighted }: CourtCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-surface rounded-xl p-4"
      style={{
        borderWidth: 0.5,
        borderColor: highlighted ? '#FF5C00' : 'rgba(255,255,255,0.08)',
      }}
    >
      <View className="flex-row items-center gap-3">
        <CourtIcon court={court} />

        <View className="flex-1">
          {/* Name + distance */}
          <View className="flex-row items-start justify-between mb-0.5">
            <Text className="font-display text-cream text-lg flex-1 mr-2" numberOfLines={1}>
              {court.name}
            </Text>
            {distance != null && (
              <Text className="font-sans text-muted text-xs mt-0.5">
                {formatDistance(distance)}
              </Text>
            )}
          </View>

          {/* Address */}
          <Text className="font-sans text-muted text-sm mb-2.5" numberOfLines={1}>
            {court.address}
          </Text>

          {/* Badges */}
          <View className="flex-row flex-wrap gap-1.5">
            {court.court_type === 'outdoor' ? (
              <Badge label="Outdoor" icon="sunny-outline" bg="#E1F5EE" color="#085041" />
            ) : (
              <Badge label="Indoor" icon="business-outline" bg="#E6F1FB" color="#0C447C" />
            )}
            {court.full_court === true && (
              <Badge label="Full court" icon="basketball-outline" bg="#EEEDFE" color="#3C3489" />
            )}
            {court.full_court === false && (
              <Badge label="Half court" icon="git-branch-outline" bg="#F1EFE8" color="#444441" />
            )}
            {court.lit && (
              <Badge label="Lit" icon="flashlight-outline" bg="#FAEEDA" color="#633806" />
            )}
            {court.is_free ? (
              <Badge label="Free" icon="checkmark-circle-outline" bg="#EAF3DE" color="#27500A" />
            ) : (
              <Badge label="Paid" icon="card-outline" bg="#FCEBEB" color="#791F1F" />
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}
