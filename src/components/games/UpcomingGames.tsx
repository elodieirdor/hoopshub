import { ScrollView, View } from 'react-native';
import { Heading } from '@/components/ui/Heading';
import { UpcomingGameCard } from '@/components/games/UpcomingGameCard';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { gameQueries } from '@/api/queries';
import { useAuthStore } from '@/store/authStore';
import { router } from 'expo-router';

export default function UpcomingGames() {
  const { data: upcoming = [] } = useQuery(gameQueries.myUpcoming());
  const currentUser = useAuthStore((s) => s.user);

  if (upcoming.length === 0) {
    return null;
  }

  return (
    <View className="pt-4 pb-2">
      <View className="pl-4">
        <Heading level={2} className="mb-3">
          YOUR UPCOMING GAMES
        </Heading>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 4 }}
      >
        {upcoming.map((game) => (
          <UpcomingGameCard
            key={game.id}
            game={game}
            isHost={game.host_id === currentUser?.id}
            onPress={() => router.push(`/games/${game.id}`)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
