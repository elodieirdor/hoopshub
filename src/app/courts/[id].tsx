import React, { useState, useEffect } from 'react';
import { ScrollView, Linking, View, Text, Pressable, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getCourt } from '@/api/courts';
import { getGames, joinGame, leaveGame } from '@/api/games';
import { DARK_MAP_STYLE } from '@/constants/mapStyle';
import { Court, Game } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { GameCard } from '@/components/games/GameCard';

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <View className="rounded-md px-2 py-[3px]" style={{ backgroundColor: color + '22' }}>
      <Text className="text-xs font-sans" style={{ color }}>
        {label}
      </Text>
    </View>
  );
}

export default function CourtDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const currentUser = useAuthStore((s) => s.user);
  const router = useRouter();

  const [court, setCourt] = useState<Court | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<number | null>(null);
  const [leavingId, setLeavingId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [courtData, allGames] = await Promise.all([
          getCourt(Number(id)),
          getGames({ court_id: Number(id) }),
        ]);
        setCourt(courtData);
        setGames(
          allGames
            .filter((g) => g.court_id === Number(id))
            .filter(
              (g) => ['open', 'full'].includes(g.status) && new Date(g.starts_at) > new Date(),
            ),
        );
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleJoin = async (gameId: number) => {
    setJoiningId(gameId);
    setGames((prev) =>
      prev.map((g) => {
        if (g.id !== gameId) return g;
        const newFilled = (g.game_players?.length ?? 0) + 1;
        return {
          ...g,
          game_players: [
            ...(g.game_players ?? []),
            {
              id: -1,
              game_id: gameId,
              player_id: currentUser?.id ?? -1,
              status: 'confirmed' as const,
              joined_at: new Date().toISOString(),
              player: currentUser!,
            },
          ],
          status: newFilled >= g.max_players ? ('full' as const) : g.status,
        };
      }),
    );
    try {
      await joinGame(gameId);
    } catch {
      setGames((prev) =>
        prev.map((g) => {
          if (g.id !== gameId) return g;
          return {
            ...g,
            game_players: (g.game_players ?? []).filter((p) => p.id !== -1),
            status: 'open' as const,
          };
        }),
      );
    } finally {
      setJoiningId(null);
    }
  };

  const handleLeave = async (gameId: number) => {
    setLeavingId(gameId);
    const snapshot = games.find((g) => g.id === gameId);
    setGames((prev) =>
      prev.map((g) => {
        if (g.id !== gameId) return g;
        return {
          ...g,
          game_players: (g.game_players ?? []).filter((p) => p.player.id !== currentUser?.id),
          status: 'open' as const,
        };
      }),
    );
    try {
      await leaveGame(gameId);
    } catch {
      if (snapshot) setGames((prev) => prev.map((g) => (g.id === gameId ? snapshot : g)));
    } finally {
      setLeavingId(null);
    }
  };

  const openDirections = () => {
    if (!court) return;
    Linking.openURL(`https://maps.google.com/?q=${court.lat},${court.lng}`);
  };

  if (loading || !court) {
    return (
      <View className="flex-1 bg-dark justify-center items-center">
        <Text className="text-muted font-sans">Loading…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-dark">
      <Stack.Screen
        options={{
          title: court.name,
          headerRight: () => (
            <Pressable onPress={() => router.push({ pathname: '/courts/edit', params: { id } })}>
              <Ionicons name="create-outline" size={22} color="#FF5C00" />
            </Pressable>
          ),
        }}
      />

      {/* Hero image / placeholder */}
      {court.images && court.images.length > 0 ? (
        <Image
          source={{ uri: court.images[0] }}
          style={{ width: '100%', height: 220 }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            height: 220,
            backgroundColor: '#181818',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="basketball-outline" size={56} color="#FF5C00" style={{ opacity: 0.25 }} />
        </View>
      )}

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-4 pt-4">
          <Text className="font-display text-4xl text-cream mb-1">{court.name}</Text>

          {/* Address + directions */}
          <Pressable onPress={openDirections} className="flex-row items-center gap-1 mb-4">
            <Ionicons name="location-outline" size={14} color="#7A7870" />
            <Text className="text-muted font-sans text-sm">{court.address}</Text>
            <Text className="text-orange font-sans text-sm ml-1">Get directions</Text>
          </Pressable>

          {/* Tags */}
          <View className="flex-row flex-wrap gap-2 mb-6">
            <Badge
              label={court.court_type}
              color={court.court_type === 'indoor' ? '#3B82F6' : '#FF5C00'}
            />
            {court.surface && <Badge label={court.surface} color="#7A7870" />}
            {court.full_court === true && <Badge label="Full court" color="#FF5C00" />}
            {court.full_court === false && <Badge label="Half court" color="#7A7870" />}
            {court.lit && <Badge label="Lit" color="#F59E0B" />}
            {court.is_free && <Badge label="Free" color="#22C55E" />}
          </View>

          {/* Mini map */}
          <MapView
            style={{ height: 140, borderRadius: 12, marginBottom: 24 }}
            customMapStyle={DARK_MAP_STYLE}
            region={{
              latitude: court.lat,
              longitude: court.lng,
              latitudeDelta: 0.008,
              longitudeDelta: 0.008,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
            pointerEvents="none"
          >
            <Marker coordinate={{ latitude: court.lat, longitude: court.lng }} />
          </MapView>

          {/* Games section */}
          <Text className="font-display text-2xl text-cream mb-3">Games here</Text>
          {games.length === 0 ? (
            <Text className="text-muted font-sans text-sm">No upcoming games.</Text>
          ) : (
            games.map((g) => (
              <GameCard
                key={g.id}
                game={g}
                onJoin={handleJoin}
                onLeave={handleLeave}
                joining={joiningId === g.id}
                leaving={leavingId === g.id}
              />
            ))
          )}

          {/* CTA */}
          <Pressable
            onPress={() => router.push({ pathname: '/games/create', params: { court_id: id } })}
            className="bg-orange rounded-xl py-4 items-center mt-6"
          >
            <Text className="text-cream font-sans font-semibold text-base">Add a game here</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
