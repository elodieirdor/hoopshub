import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  FlatList,
  RefreshControl,
  Dimensions,
  TextInput as RNTextInput,
  Animated,
  PanResponder,
  View,
  Text,
  Pressable,
} from 'react-native';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { FilterChips } from '@/components/ui/FilterChips';
import { CourtPin } from '@/components/courts/CourtPin';
import { CourtCard } from '@/components/courts/CourtCard';
import { courtQueries } from '@/api/queries';
import { DARK_MAP_STYLE } from '@/constants/mapStyle';
import { Court } from '@/types';
import { haversineKm } from '@/utils/geo';
import CourtCardSkeleton from '@/components/courts/CourtCardSkeleton';
import MapSkeleton from '@/components/courts/MapSkeleton';
import { useLocationStore } from '@/store/locationStore';
import { ErrorState } from '@/components/ui/ErrorState';

// ── Skeleton ──────────────────────────────────────────────────────────────────

const SKELETON_COUNT = 5;

type FilterKey = 'all' | 'outdoor' | 'indoor' | 'full_court' | 'lit' | 'free';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'outdoor', label: 'Outdoor' },
  { key: 'indoor', label: 'Indoor' },
  { key: 'full_court', label: 'Full court' },
  { key: 'lit', label: 'Lit' },
  { key: 'free', label: 'Free' },
];

const SCREEN_HEIGHT = Dimensions.get('window').height;
// Three snap points: hidden / default 35% / expanded 65%
const SNAP_POINTS = [0, SCREEN_HEIGHT * 0.35, SCREEN_HEIGHT * 0.65] as const;
type SnapIndex = 0 | 1 | 2;

export default function CourtsScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const listRef = useRef<FlatList>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { activeCity, setUserLocation: storeSetUserLocation } = useLocationStore();

  const {
    data: courts = [],
    isLoading: loading,
    isRefetching: refreshing,
    error: courtsError,
    refetch,
  } = useQuery(courtQueries.list(activeCity));

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [selectedCourtId, setSelectedCourtId] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // ── Expandable map ────────────────────────────────────────────────────────
  const snapIndexRef = useRef<SnapIndex>(1);
  const [snapIndex, setSnapIndex] = useState<SnapIndex>(1);
  const mapHeight = useRef(new Animated.Value(SNAP_POINTS[1])).current;

  const snapTo = useCallback(
    (index: SnapIndex) => {
      snapIndexRef.current = index;
      setSnapIndex(index);
      Animated.spring(mapHeight, {
        toValue: SNAP_POINTS[index],
        useNativeDriver: false,
        bounciness: 4,
      }).start();
    },
    [mapHeight],
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dy) > 3,
      onPanResponderMove: (_, gs) => {
        const base = SNAP_POINTS[snapIndexRef.current];
        const next = Math.max(0, Math.min(SNAP_POINTS[2], base + gs.dy));
        mapHeight.setValue(next);
      },
      onPanResponderRelease: (_, gs) => {
        const base = SNAP_POINTS[snapIndexRef.current];
        const current = base + gs.dy;
        let nearestIdx: SnapIndex = 1;
        let minDist = Infinity;
        (SNAP_POINTS as readonly number[]).forEach((snap, i) => {
          const dist = Math.abs(current - snap);
          if (dist < minDist) {
            minDist = dist;
            nearestIdx = i as SnapIndex;
          }
        });
        snapIndexRef.current = nearestIdx;
        setSnapIndex(nearestIdx);
        Animated.spring(mapHeight, {
          toValue: SNAP_POINTS[nearestIdx],
          useNativeDriver: false,
          bounciness: 4,
        }).start();
      },
    }),
  ).current;

  // ── Location ──────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({});
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserLocation({ lat, lng });
        storeSetUserLocation(lat, lng);
      }
    })();
  }, []);

  const onRefresh = () => refetch();

  // ── Filtered + sorted list ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = courts;
    if (activeFilter === 'outdoor') {
      result = result.filter((c) => c.court_type === 'outdoor');
    }
    if (activeFilter === 'indoor') {
      result = result.filter((c) => c.court_type === 'indoor');
    }
    if (activeFilter === 'full_court') {
      result = result.filter((c) => c.full_court === true);
    }
    if (activeFilter === 'lit') {
      result = result.filter((c) => c.lit);
    }
    if (activeFilter === 'free') {
      result = result.filter((c) => c.is_free);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) => c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q),
      );
    }
    // Sort by proximity ascending
    if (userLocation) {
      result = [...result].sort(
        (a, b) =>
          haversineKm(userLocation.lat, userLocation.lng, a.lat, a.lng) -
          haversineKm(userLocation.lat, userLocation.lng, b.lat, b.lng),
      );
    }
    return result;
  }, [courts, activeFilter, search, userLocation]);

  // ── Pin press → scroll + 1.5s highlight ──────────────────────────────────
  const handlePinPress = useCallback(
    (court: Court) => {
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
      setSelectedCourtId(court.id);
      const index = filtered.findIndex((c) => c.id === court.id);
      if (index >= 0) {
        listRef.current?.scrollToIndex({ index, animated: true, viewOffset: 8 });
      }
      highlightTimer.current = setTimeout(() => setSelectedCourtId(null), 1500);
    },
    [filtered],
  );

  // ── See all / Show map toggle ─────────────────────────────────────────────
  const handleSeeAll = () => {
    snapTo(snapIndex === 0 ? 1 : 0);
  };

  return (
    <View className="flex-1 bg-dark">
      {/* Map */}
      <Animated.View style={{ height: mapHeight }}>
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          customMapStyle={DARK_MAP_STYLE}
          initialRegion={{
            latitude: activeCity?.lat ?? -43.5321,
            longitude: activeCity?.lng ?? 172.6362,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          scrollEnabled
          zoomEnabled
          showsUserLocation
          showsMyLocationButton={true}
          userInterfaceStyle="dark"
        >
          {filtered.map((c) => (
            <CourtPin
              key={c.id}
              court={c}
              onPress={() => handlePinPress(c)}
              onCalloutPress={() => router.push(`/courts/${c.id}`)}
            />
          ))}
        </MapView>
        {loading && <MapSkeleton />}
      </Animated.View>

      {/* Drag handle */}
      <View {...panResponder.panHandlers} className="bg-dark items-center py-2">
        <View className="w-9 h-1 bg-white/20 rounded-sm" />
      </View>

      {/* Bottom panel */}
      <View className="flex-1">
        {/* Search bar — fixed, never scrolls away */}
        <View className="px-4 pb-2" style={{ paddingTop: snapIndex === 0 ? insets.top + 8 : 8 }}>
          <View
            className="flex-row items-center h-11 rounded-[20px]"
            style={{
              backgroundColor: 'rgba(20,20,20,0.92)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.12)',
              paddingHorizontal: 14,
            }}
          >
            <Ionicons name="search-outline" size={16} color="#7A7870" />
            <RNTextInput
              className="flex-1 ml-2 text-cream font-sans text-sm"
              placeholder="Search courts..."
              placeholderTextColor="#7A7870"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {/* Court list — header contains nearby row + filter chips */}
        <FlatList
          ref={listRef}
          className="flex-1"
          data={filtered}
          keyExtractor={(c) => String(c.id)}
          renderItem={({ item }) => (
            <CourtCard
              court={item}
              onPress={() => router.push(`/courts/${item.id}`)}
              highlighted={item.id === selectedCourtId}
              distance={
                userLocation
                  ? haversineKm(userLocation.lat, userLocation.lng, item.lat, item.lng)
                  : undefined
              }
            />
          )}
          ListHeaderComponent={
            <View className="mb-3">
              {/* Nearby courts row */}
              <View className="flex-row items-baseline justify-between mb-2.5">
                <View className="flex-row items-baseline gap-1.5">
                  <Text className="font-display text-cream text-lg my-1">NEARBY COURTS</Text>
                  <Text className="font-sans text-muted text-sm">({filtered.length})</Text>
                </View>
                <Pressable onPress={handleSeeAll}>
                  <Text className="font-sans text-orange text-sm font-medium">
                    {snapIndex === 0 ? 'Show map ←' : 'See all →'}
                  </Text>
                </Pressable>
              </View>

              {/* Filter chips */}
              <FilterChips
                chips={FILTERS}
                isActive={(key) => activeFilter === key}
                onPress={setActiveFilter}
                size="sm"
              />
            </View>
          }
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 16,
            gap: 12,
          }}
          onScrollToIndexFailed={({ index }) => {
            setTimeout(() => {
              listRef.current?.scrollToIndex({ index, animated: true, viewOffset: 8 });
            }, 300);
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF5C00" />
          }
          ListEmptyComponent={
            loading ? (
              <View className="gap-3">
                {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                  <CourtCardSkeleton key={i} />
                ))}
              </View>
            ) : courtsError ? (
              <View className="flex-1">
                <ErrorState message="Can't connect — check your connection" onRetry={refetch} />
              </View>
            ) : (
              <Text className="text-muted text-center font-sans mt-8">
                No courts found in your area
              </Text>
            )
          }
        />
      </View>
    </View>
  );
}
