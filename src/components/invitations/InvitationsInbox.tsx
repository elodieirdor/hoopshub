import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Heading } from '@/components/ui/Heading';
import { formatDate } from '@/utils/formatters';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invitationQueries } from '@/api/queries';
import { respondToInvitation } from '@/api/invitations';
import { GameInvitation } from '@/types';

export function InvitationsInbox() {
  const queryClient = useQueryClient();

  const { data: invitations = [] } = useQuery(invitationQueries.myPending());

  const respondMutation = useMutation({
    mutationFn: ({
      invitation,
      status,
    }: {
      invitation: GameInvitation;
      status: 'accepted' | 'declined';
    }) => respondToInvitation(invitation.game_id, invitation.id, status),
    onMutate: async ({ invitation }) => {
      await queryClient.cancelQueries({ queryKey: invitationQueries.myPending().queryKey });
      const previous = queryClient.getQueryData<GameInvitation[]>(
        invitationQueries.myPending().queryKey,
      );
      queryClient.setQueryData<GameInvitation[]>(
        invitationQueries.myPending().queryKey,
        (old = []) => old.filter((inv) => inv.id !== invitation.id),
      );
      return { previous };
    },
    onSuccess: (_data, variables) => {
      if (variables.status === 'accepted') {
        queryClient.invalidateQueries({ queryKey: ['games'] });
      }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(invitationQueries.myPending().queryKey, context.previous);
      }
      Alert.alert('Error', 'Could not respond to invitation. Please try again.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: invitationQueries.myPending().queryKey });
    },
  });

  if (invitations.length === 0) {
    return null;
  }

  return (
    <View className="pt-4 pb-2">
      <View className="pl-4">
        <Heading level={2} className="mb-3">
          INVITATIONS ({invitations.length})
        </Heading>
      </View>
      <ScrollView horizontal contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 4 }}>
        {invitations.map((invitation) => (
          <View
            key={invitation.id}
            style={{
              width: 260,
              backgroundColor: '#181818',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.08)',
              padding: 14,
              marginRight: 12,
            }}
          >
            <Pressable
              onPress={() => router.push(`/games/${invitation.game_id}`)}
              style={({ pressed }) => ({ marginBottom: 12, opacity: pressed ? 0.6 : 1 })}
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
                {invitation.game.title}
              </Text>
              <Text
                style={{ fontFamily: 'DMSans', fontSize: 12, color: '#7A7870', marginBottom: 1 }}
              >
                {invitation.game.court?.name ?? '—'} · {formatDate(invitation.game.starts_at)}
              </Text>
              <Text style={{ fontFamily: 'DMSans', fontSize: 12, color: '#7A7870' }}>
                Invited by {invitation.inviter.name}
              </Text>
            </Pressable>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={() => respondMutation.mutate({ invitation, status: 'declined' })}
                disabled={respondMutation.isPending}
                style={{
                  flex: 1,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.12)',
                  paddingVertical: 9,
                  alignItems: 'center',
                }}
              >
                {respondMutation.isPending &&
                respondMutation.variables?.invitation.id === invitation.id &&
                respondMutation.variables?.status === 'declined' ? (
                  <ActivityIndicator size="small" color="#7A7870" />
                ) : (
                  <Text style={{ fontFamily: 'DMSans', fontSize: 13, color: '#7A7870' }}>
                    Decline
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => respondMutation.mutate({ invitation, status: 'accepted' })}
                disabled={respondMutation.isPending}
                style={{
                  flex: 1,
                  borderRadius: 8,
                  backgroundColor: '#FF5C00',
                  paddingVertical: 9,
                  alignItems: 'center',
                }}
              >
                {respondMutation.isPending &&
                respondMutation.variables?.invitation.id === invitation.id &&
                respondMutation.variables?.status === 'accepted' ? (
                  <ActivityIndicator size="small" color="#F0EDE8" />
                ) : (
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
                )}
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
