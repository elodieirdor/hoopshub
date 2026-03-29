import React, { useMemo } from 'react';
import { Image, Linking, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { courtQueries, gameQueries } from '@/api/queries';
import { DARK_MAP_STYLE } from '@/constants/mapStyle';
import { GameCard } from '@/components/games/GameCard';
import { Badge } from '@/components/ui/Badge';
import { Heading } from '@/components/ui/Heading';
import { ErrorState } from '@/components/ui/ErrorState';
import { CourtDetailSkeleton } from '@/components/courts/CourtDetailSkeleton';

export default function CourtDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const courtId = Number(id);

  const {
    data: court,
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useQuery(courtQueries.detail(courtId));

  const { data: allGames = [] } = useQuery(gameQueries.forCourt(courtId));

  const games = useMemo(
    () =>
      allGames.filter(
        (g) => ['open', 'full'].includes(g.status) && new Date(g.starts_at) > new Date(),
      ),
    [allGames],
  );

  const openDirections = () => {
    if (!court) return;
    Linking.openURL(`https://maps.google.com/?q=${court.lat},${court.lng}`);
  };

  if (isLoading) {
    return <CourtDetailSkeleton />;
  }

  if (error || !court) {
    return (
      <View className="flex-1 bg-dark">
        <ErrorState message="Can't connect — check your connection" onRetry={refetch} />
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

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#FF5C00" />
        }
      >
        <View className="px-4 pt-4">
          <Heading className="mb-1">{court.name}</Heading>

          <Pressable onPress={openDirections} className="flex-row items-center gap-1 mb-4">
            <Ionicons name="location-outline" size={14} color="#7A7870" />
            <Text className="text-muted font-sans text-sm">{court.address}</Text>
            <Text className="text-orange font-sans text-sm ml-1">Get directions</Text>
          </Pressable>

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

          <Heading level={2} className="mb-3">
            Games here
          </Heading>
          {games.length === 0 ? (
            <Text className="text-muted font-sans text-sm">No upcoming games.</Text>
          ) : (
            games.map((g) => <GameCard key={g.id} game={g} />)
          )}

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
