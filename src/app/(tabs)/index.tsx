import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { InvitationsInbox } from '@/components/invitations/InvitationsInbox';
import UpcomingGames from '@/components/games/UpcomingGames';
import AllGames from '@/components/games/AllGames';
import { router } from 'expo-router';
import { Heading } from '@/components/ui/Heading';

export default function GamesScreen() {
  const { top, bottom } = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <View className="flex-1 bg-dark" style={{ paddingTop: top, paddingBottom: bottom }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
          <Heading>PICKUP GAMES</Heading>
          <Pressable
            onPress={() => router.push('/games/create')}
            className="bg-orange rounded-lg px-3 py-2"
          >
            <Text className="text-cream font-sans font-semibold text-sm">Post game</Text>
          </Pressable>
        </View>

        <ScrollView>
          <UpcomingGames />

          <InvitationsInbox />

          <AllGames />
        </ScrollView>
      </View>
    </View>
  );
}
