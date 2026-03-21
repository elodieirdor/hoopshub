import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, Linking } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, Pressable } from 'react-native';
import { getCourt } from '@/api/courts';
import { getGames } from '@/api/games';
import { DARK_MAP_STYLE } from '@/constants/mapStyle';
import { Court, Game } from '@/types';

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <View
      style={{
        backgroundColor: color + '22',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
      }}
    >
      <Text style={{ color, fontSize: 12, fontFamily: 'DMSans_400Regular' }}>{label}</Text>
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
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: '#0A0A0A',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text className="text-muted font-sans">Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      {/* Back header */}
      <Pressable
        onPress={() => router.back()}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
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
          <Pressable
            onPress={openDirections}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 }}
          >
            <Ionicons name="location-outline" size={14} color="#7A7870" />
            <Text className="text-muted font-sans text-sm">{court.address}</Text>
            <Text className="text-orange font-sans text-sm" style={{ marginLeft: 4 }}>
              Get directions
            </Text>
          </Pressable>

          {/* Tags */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
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
                style={{
                  backgroundColor: '#181818',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                }}
              >
                <Text className="text-cream font-sans" style={{ fontWeight: '600' }}>
                  {g.title}
                </Text>
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
            style={{
              backgroundColor: '#FF5C00',
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center',
              marginTop: 24,
            }}
          >
            <Text className="text-cream font-sans" style={{ fontWeight: '600', fontSize: 16 }}>
              Add a game here
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
