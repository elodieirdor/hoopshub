import React from 'react';
import { View, Text } from 'react-native';
import { Game } from '@/types';
import { SKILL_COLORS } from '@/utils/formatters';

export function SkillTag({ level }: { level: Game['skill_level'] }) {
  const color = SKILL_COLORS[level] ?? '#7A7870';
  return (
    <View className="rounded-md px-2 py-[3px]" style={{ backgroundColor: color + '22' }}>
      <Text className="text-xs font-sans" style={{ color }}>
        {level}
      </Text>
    </View>
  );
}
