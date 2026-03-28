import React from 'react';
import { ActivityIndicator, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Heading } from '@/components/ui/Heading';
import { formatDate } from '@/utils/formatters';
import { GameInvitation } from '@/types';

type Props = {
  invitation: GameInvitation;
  onAccept: () => void;
  onDecline: () => void;
  isPending: boolean;
  pendingStatus: 'accepted' | 'declined' | null;
};

export function InvitationCard({
  invitation,
  onAccept,
  onDecline,
  isPending,
  pendingStatus,
}: Props) {
  return (
    <View
      className="bg-surface rounded-xl border border-white/[0.08] p-[14px] mr-3"
      style={{ width: 260 }}
    >
      <Pressable
        onPress={() => router.push(`/games/${invitation.game_id}`)}
        style={({ pressed }) => ({ marginBottom: 12, opacity: pressed ? 0.6 : 1 })}
      >
        <Heading level={3} className="mb-0.5" numberOfLines={1}>
          {invitation.game.title}
        </Heading>
        <Text className="font-sans text-xs text-muted mb-0.5">
          {invitation.game.court?.name ?? '—'} · {formatDate(invitation.game.starts_at)}
        </Text>
        <Text className="font-sans text-xs text-muted">Invited by {invitation.inviter.name}</Text>
      </Pressable>

      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={onDecline}
          disabled={isPending}
          className="flex-1 rounded-lg border border-white/[0.12] py-[9px] items-center"
        >
          {isPending && pendingStatus === 'declined' ? (
            <ActivityIndicator size="small" color="#7A7870" />
          ) : (
            <Text className="font-sans text-[13px] text-muted">Decline</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onAccept}
          disabled={isPending}
          className="flex-1 rounded-lg bg-orange py-[9px] items-center"
        >
          {isPending && pendingStatus === 'accepted' ? (
            <ActivityIndicator size="small" color="#F0EDE8" />
          ) : (
            <Text className="font-sans text-[13px] text-cream font-semibold">Accept →</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
