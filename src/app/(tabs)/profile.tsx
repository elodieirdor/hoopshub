import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { GameHistoryRow } from '@/components/games/GameHistoryRow';
import { ProfileIdentity } from '@/components/profile/ProfileIdentity';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { ProfileRepSection } from '@/components/profile/ProfileRepSection';
import { InvitationsInbox } from '@/components/invitations/InvitationsInbox';
import { invitationQueries, gameQueries } from '@/api/queries';
import { respondToInvitation } from '@/api/invitations';

export default function ProfileScreen() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: invitations = [] } = useQuery(invitationQueries.myPending());

  const respondMutation = useMutation({
    mutationFn: ({
      gameId,
      id,
      status,
    }: {
      gameId: number;
      id: number;
      status: 'accepted' | 'declined';
    }) => respondToInvitation(gameId, id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: invitationQueries.myPending().queryKey });
      if (variables.status === 'accepted') {
        // Accepting joins the game server-side — bust all game queries so
        // upcoming games and feed reflect the new player counts.
        queryClient.invalidateQueries({ queryKey: ['games'] });
      }
    },
    onError: () => Alert.alert('Error', 'Could not respond to invitation. Please try again.'),
  });

  if (!user) {
    return (
      <View className="flex-1 bg-dark items-center justify-center">
        <ActivityIndicator color="#FF5C00" />
      </View>
    );
  }

  const avgRating = Number(user.avg_rating ?? 0);
  const repRatings = user.ratings ?? {
    punctuality: avgRating,
    sportsmanship: avgRating,
    skill_accuracy: avgRating,
    fun_to_play: avgRating,
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <View className="flex-1 bg-dark" style={{ paddingTop: top }}>
      {/* Fixed header */}
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <Text className="font-display text-4xl text-cream">PROFILE</Text>
        <Pressable onPress={() => setMenuOpen(true)} hitSlop={12}>
          <Ionicons name="ellipsis-vertical" size={20} color="#F0EDE8" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: bottom + 32 }}
        // refreshControl={
        //   <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#FF5C00" />
        // }
      >
        <InvitationsInbox
          invitations={invitations}
          onRespond={(gameId, id, status) => respondMutation.mutate({ gameId, id, status })}
        />

        <ProfileIdentity user={user} />

        <View
          style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: 16 }}
        />

        <ProfileStats
          stats={[
            { value: user.games_played ?? 0, label: 'Games played' },
            {
              value: avgRating > 0 ? avgRating.toFixed(1) : '—',
              label: 'Avg rating',
              highlight: true,
            },
            { value: '—', label: 'Courts visited' },
          ]}
        />

        <View
          style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: 16 }}
        />

        <View className="px-4 pt-5 pb-4">
          <ProfileRepSection ratings={repRatings} />
        </View>

        <View className="px-4 pt-2 pb-6">
          <Text className="font-display text-2xl text-cream mb-4">RECENT GAMES</Text>
          {user.recent_games.length === 0 ? (
            <View className="items-center py-8">
              <Ionicons name="basketball-outline" size={32} color="#7A7870" />
              <Text className="text-muted font-sans text-sm mt-3 text-center">
                No games yet.{'\n'}Join or host a game to get started.
              </Text>
            </View>
          ) : (
            user.recent_games.map((game) => <GameHistoryRow key={game.id} game={game} />)
          )}
        </View>
      </ScrollView>

      {/* Options modal */}
      <Modal visible={menuOpen} transparent animationType="slide" onRequestClose={closeMenu}>
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onPress={closeMenu}
        >
          <Pressable onPress={() => {}}>
            <View className="bg-surface rounded-t-[20px] border border-white/[0.08] overflow-hidden">
              {/* Handle */}
              <View className="items-center pt-3 pb-2">
                <View className="w-9 h-1 rounded-full bg-white/20" />
              </View>

              <Pressable
                onPress={() => {
                  closeMenu();
                  router.push('/profile/edit');
                }}
                className="flex-row items-center gap-4 px-5 py-4"
              >
                <Ionicons name="pencil-outline" size={20} color="#F0EDE8" />
                <Text className="text-cream font-sans text-base">Edit profile</Text>
              </Pressable>

              <View className="h-px bg-white/[0.08] mx-5" />

              <Pressable
                onPress={() => {
                  closeMenu();
                  router.push('/profile/settings');
                }}
                className="flex-row items-center gap-4 px-5 py-4"
              >
                <Ionicons name="settings-outline" size={20} color="#F0EDE8" />
                <Text className="text-cream font-sans text-base">Settings</Text>
              </Pressable>

              <View className="h-px bg-white/[0.08] mx-5" />

              <Pressable
                onPress={closeMenu}
                className="flex-row items-center justify-center px-5 py-4"
              >
                <Text className="text-muted font-sans text-base">Cancel</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
