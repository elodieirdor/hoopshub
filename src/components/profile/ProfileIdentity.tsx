import React from 'react';
import { View, Text } from 'react-native';
import { Badge } from '@/components/ui/Badge';
import { initials, SKILL_COLORS } from '@/utils/formatters';
import { User } from '@/types';

interface Props {
  user: User;
  avatarBgColor?: string;
  avatarSize?: number;
  avatarBorder?: boolean;
}

export function ProfileIdentity({
  user,
  avatarBgColor = '#FF5C00',
  avatarSize = 72,
  avatarBorder = false,
}: Props) {
  const skillColor = SKILL_COLORS[user.skill_level] ?? '#7A7870';

  return (
    <View className="items-center px-4 pt-6 pb-6">
      <View
        className="rounded-full items-center justify-center mb-4"
        style={{
          width: avatarSize,
          height: avatarSize,
          backgroundColor: avatarBgColor,
          ...(avatarBorder && { borderWidth: 2, borderColor: '#FF5C00' }),
        }}
      >
        <Text
          style={{
            color: '#fff',
            fontFamily: 'DMSans_600SemiBold',
            fontSize: Math.round(avatarSize * 0.38),
          }}
        >
          {initials(user.name)}
        </Text>
      </View>

      <Text className="font-display text-3xl text-cream mb-1">{user.name.toUpperCase()}</Text>

      <Text className="text-muted font-sans text-sm mb-4">
        @{user.username}
        {user.city ? ` · ${user.city}` : ''}
      </Text>

      <View className="flex-row gap-2 flex-wrap justify-center">
        <Badge
          label={user.skill_level.charAt(0).toUpperCase() + user.skill_level.slice(1)}
          color={skillColor}
        />
        {user.position && user.position !== 'Any' && (
          <Badge label={user.position} color="#7A7870" />
        )}
      </View>

      {!!user.member_since && (
        <Text className="text-muted font-sans text-xs mt-2">Member since {user.member_since}</Text>
      )}
    </View>
  );
}
