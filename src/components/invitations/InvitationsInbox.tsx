import React from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { Heading } from '@/components/ui/Heading';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invitationQueries } from '@/api/queries';
import { respondToInvitation } from '@/api/invitations';
import { GameInvitation } from '@/types';
import { InvitationCard } from './InvitationCard';

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
        {invitations.map((invitation) => {
          const isThisCard =
            respondMutation.isPending && respondMutation.variables?.invitation.id === invitation.id;
          return (
            <InvitationCard
              key={invitation.id}
              invitation={invitation}
              onAccept={() => respondMutation.mutate({ invitation, status: 'accepted' })}
              onDecline={() => respondMutation.mutate({ invitation, status: 'declined' })}
              isPending={isThisCard}
              pendingStatus={isThisCard ? (respondMutation.variables?.status ?? null) : null}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}
