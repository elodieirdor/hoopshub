import { create } from 'zustand';
import * as Location from 'expo-location';
import { City } from '@/types';
import { getCities } from '@/api/cities';

interface LocationState {
  userLat: number | null;
  userLng: number | null;
  activeCity: City | null;
  cities: City[];
  locationReady: boolean;

  init: () => Promise<void>;
  setActiveCity: (city: City) => void;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  userLat: null,
  userLng: null,
  activeCity: null,
  cities: [],
  locationReady: false,

  init: async () => {
    // Load supported cities from API
    let cities: City[] = [];
    try {
      const result = await getCities();
      cities = Array.isArray(result) ? result : [];
    } catch {
      // cities stays []
    }
    set({ cities });

    if (cities.length === 0) {
      set({ locationReady: true });
      return;
    }

    // Request location permission
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      const defaultCity = cities.find((c) => c.slug === 'christchurch') ?? cities[0];
      set({ activeCity: defaultCity, locationReady: true });
      return;
    }

    // Get current position
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude: lat, longitude: lng } = location.coords;

    // Find nearest supported city
    const nearest = cities.reduce((closest, city) => {
      const dist = Math.sqrt(Math.pow(city.lat - lat, 2) + Math.pow(city.lng - lng, 2));
      const closestDist = Math.sqrt(
        Math.pow(closest.lat - lat, 2) + Math.pow(closest.lng - lng, 2),
      );
      return dist < closestDist ? city : closest;
    });

    set({
      userLat: lat,
      userLng: lng,
      activeCity: nearest,
      locationReady: true,
    });
  },

  setActiveCity: (city) => set({ activeCity: city }),
}));
