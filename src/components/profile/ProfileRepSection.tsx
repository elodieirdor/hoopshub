import React from 'react';
import { View, Text } from 'react-native';
import { Heading } from '@/components/ui/Heading';
import { Stars } from '@/components/ui/Stars';
import { User } from '@/types';

const ROWS: { label: string; key: keyof User['ratings'] }[] = [
  { label: 'Shows up on time', key: 'punctuality' },
  { label: 'Good sportsmanship', key: 'sportsmanship' },
  { label: 'Right skill level', key: 'skill_accuracy' },
  { label: 'Fun to play with', key: 'fun_to_play' },
];

interface Props {
  ratings: User['ratings'];
  showValue?: boolean;
}

export function ProfileRepSection({ ratings, showValue = false }: Props) {
  return (
    <View
      className="rounded-xl"
      style={{ backgroundColor: '#181818', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}
    >
      <Heading level={3} className="px-4 pt-4 pb-3">
        COMMUNITY REP
      </Heading>
      {ROWS.map((row) => {
        const value = ratings[row.key];
        return (
          <View key={row.label}>
            <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
            <View className="flex-row items-center justify-between px-4 py-3">
              <Text className="text-cream font-sans text-sm flex-1">{row.label}</Text>
              {value > 0 ? (
                <Stars rating={value} showValue={showValue} />
              ) : (
                <Text className="text-muted font-sans text-xs">No ratings yet</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}
