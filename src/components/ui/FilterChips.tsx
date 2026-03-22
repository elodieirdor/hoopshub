import React from 'react';
import { View, ScrollView, Pressable, Text, ViewStyle } from 'react-native';

interface Chip<T extends string> {
  key: T;
  label: string;
}

interface FilterChipsProps<T extends string> {
  chips: Chip<T>[];
  isActive: (key: T) => boolean;
  onPress: (key: T) => void;
  size?: 'sm' | 'md';
  contentContainerStyle?: ViewStyle;
}

export function FilterChips<T extends string>({
  chips,
  isActive,
  onPress,
  size = 'md',
  contentContainerStyle,
}: FilterChipsProps<T>) {
  const isSm = size === 'sm';

  return (
    <View style={{ paddingVertical: 8 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[{ gap: 8, flexDirection: 'row' }, contentContainerStyle]}
      >
        {chips.map(({ key, label }) => {
          const active = isActive(key);
          return (
            <Pressable
              key={key}
              onPress={() => onPress(key)}
              className="rounded-full"
              style={[
                isSm
                  ? { paddingHorizontal: 12, paddingVertical: 6 }
                  : { paddingHorizontal: 16, paddingVertical: 8 },
                {
                  backgroundColor: active ? '#FF5C00' : '#181818',
                  borderWidth: isSm ? 0.5 : 1,
                  borderColor: active ? '#FF5C00' : 'rgba(255,255,255,0.08)',
                },
              ]}
            >
              <Text
                className="font-sans"
                style={[
                  isSm ? { fontSize: 12 } : { fontSize: 14 },
                  { color: active ? '#F0EDE8' : '#7A7870' },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
