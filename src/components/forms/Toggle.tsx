import React from 'react';
import { View, Text, Pressable } from 'react-native';

interface Props {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

export function Toggle({ label, value, onChange }: Props) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      className="flex-row items-center justify-between py-4"
      style={{ borderBottomWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)' }}
    >
      <Text className="text-cream font-sans text-base">{label}</Text>
      <View
        className="w-12 h-7 rounded-full justify-center px-1"
        style={{
          backgroundColor: value ? '#FF5C00' : '#181818',
          borderWidth: 0.5,
          borderColor: value ? '#FF5C00' : 'rgba(255,255,255,0.08)',
        }}
      >
        <View
          className="w-5 h-5 rounded-full bg-cream"
          style={{ alignSelf: value ? 'flex-end' : 'flex-start' }}
        />
      </View>
    </Pressable>
  );
}
