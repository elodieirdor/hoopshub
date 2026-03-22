import React from 'react';
import { View, Text, Pressable } from 'react-native';

interface Option<T extends string> {
  label: string;
  value: T;
}

interface Props<T extends string> {
  label: string;
  options: Option<T>[];
  value: T | null;
  onChange: (v: T) => void;
}

export function SegmentedControl<T extends string>({ label, options, value, onChange }: Props<T>) {
  return (
    <View className="mb-5">
      <Text className="text-cream font-sans text-sm mb-2">{label}</Text>
      <View className="flex-row gap-2">
        {options.map((o) => {
          const active = value === o.value;
          return (
            <Pressable
              key={o.value}
              onPress={() => onChange(o.value)}
              className="flex-1 py-3 rounded-xl items-center"
              style={{
                backgroundColor: active ? '#FF5C00' : '#181818',
                borderWidth: 0.5,
                borderColor: active ? '#FF5C00' : 'rgba(255,255,255,0.08)',
              }}
            >
              <Text className="font-sans text-sm" style={{ color: active ? '#F0EDE8' : '#7A7870' }}>
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
