import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { GameInvitation } from '@/types';
import { formatDate } from '@/utils/formatters';

interface Props {
  invitations: GameInvitation[];
  onRespond: (id: number, status: 'accepted' | 'declined') => void;
}

export function InvitationsInbox({ invitations, onRespond }: Props) {
  if (invitations.length === 0) return null;

  return (
    <View className="px-4 pt-4 pb-2">
      <Text className="font-display text-2xl text-cream mb-3">
        INVITATIONS ({invitations.length})
      </Text>
      <View style={{ gap: 10 }}>
        {invitations.map((inv) => (
          <View
            key={inv.id}
            style={{
              backgroundColor: '#181818',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.08)',
              padding: 14,
            }}
          >
            <Text
              style={{
                fontFamily: 'BebasNeue_400Regular',
                fontSize: 16,
                color: '#F0EDE8',
                marginBottom: 2,
              }}
              numberOfLines={1}
            >
              {inv.game.title}
            </Text>
            <Text style={{ fontFamily: 'DMSans', fontSize: 12, color: '#7A7870', marginBottom: 1 }}>
              {inv.game.court?.name ?? '—'} · {formatDate(inv.game.starts_at)}
            </Text>
            <Text
              style={{ fontFamily: 'DMSans', fontSize: 12, color: '#7A7870', marginBottom: 12 }}
            >
              Invited by {inv.inviter.name}
            </Text>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable
                onPress={() => onRespond(inv.id, 'declined')}
                style={{
                  flex: 1,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.12)',
                  paddingVertical: 9,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontFamily: 'DMSans', fontSize: 13, color: '#7A7870' }}>
                  Decline
                </Text>
              </Pressable>
              <Pressable
                onPress={() => onRespond(inv.id, 'accepted')}
                style={{
                  flex: 1,
                  borderRadius: 8,
                  backgroundColor: '#FF5C00',
                  paddingVertical: 9,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: 'DMSans',
                    fontSize: 13,
                    color: '#F0EDE8',
                    fontWeight: '600',
                  }}
                >
                  Accept →
                </Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
