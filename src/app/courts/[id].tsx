import React, { useState, useEffect } from 'react';
import { ScrollView, Linking, View, Text, Pressable } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getCourt } from '@/api/courts';
import { getGames } from '@/api/games';
import { DARK_MAP_STYLE } from '@/constants/mapStyle';
import { Court, Game } from '@/types';

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <View className="rounded-md px-2 py-[3px]" style={{ backgroundColor: color + '22' }}>
      <Text className="text-xs font-sans" style={{ color }}>
        {label}
      </Text>
    </View>
  );
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-NZ', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function CourtDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [court, setCourt] = useState<Court | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

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
      {/* Back header */}
      <Pressable onPress={() => router.back()} className="px-4 py-3 flex-row items-center gap-2">
        <Ionicons name="arrow-back" size={20} color="#F0EDE8" />
        <Text className="text-cream font-sans">Courts</Text>
      </Pressable>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Static mini map */}
        <MapView
          style={{ height: 180 }}
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
            {court.full_court && <Badge label="Full court" color="#FF5C00" />}
            {court.lit && <Badge label="Lit" color="#F59E0B" />}
            {court.is_free && <Badge label="Free" color="#22C55E" />}
          </View>

          {/* Games section */}
          <Text className="font-display text-2xl text-cream mb-3">Games here</Text>
          {games.length === 0 ? (
            <Text className="text-muted font-sans text-sm">No upcoming games.</Text>
          ) : (
            games.map((g) => (
              <Pressable
                key={g.id}
                onPress={() => router.push(`/games/${g.id}`)}
                className="bg-surface border border-border rounded-xl p-4 mb-3"
              >
                <Text className="text-cream font-sans font-semibold">{g.title}</Text>
                <Text className="text-muted font-sans text-sm">{formatDate(g.starts_at)}</Text>
                <Text className="text-muted font-sans text-xs">
                  {g.game_players.length}/{g.max_players} players · {g.skill_level} · {g.game_type}
                </Text>
              </Pressable>
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
