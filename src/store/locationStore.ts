import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { City } from '@/types';
import { getCities } from '@/api/cities';

const CITY_STORE_KEY = 'active_city_id';

interface LocationState {
  userLat: number | null;
  userLng: number | null;
  activeCity: City | null;
  cities: City[];
  locationReady: boolean;

  init: () => Promise<void>;
  setActiveCity: (city: City) => void;
  setUserLocation: (lat: number, lng: number) => void;
  syncCityWithUser: (cityName: string | null | undefined) => Promise<void>;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  userLat: null,
  userLng: null,
  activeCity: null,
  cities: [],
  locationReady: false,

  init: async () => {
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

    // Priority 1: user's explicit manual choice (persisted)
    const savedId = await SecureStore.getItemAsync(CITY_STORE_KEY);
    if (savedId) {
      const saved = cities.find((c) => String(c.id) === savedId);
      if (saved) {
        set({ activeCity: saved, locationReady: true });
        return;
      }
    }

    // Priority 2: fall back to default — syncCityWithUser() will override
    // this with the user's profile city once auth loads
    const defaultCity = cities.find((c) => c.slug === 'christchurch') ?? cities[0];
    set({ activeCity: defaultCity, locationReady: true });
  },

  // Called from authStore after loading user — syncs profile city unless
  // the user has an explicit manual SecureStore preference.
  syncCityWithUser: async (cityName) => {
    if (!cityName) return;
    const savedId = await SecureStore.getItemAsync(CITY_STORE_KEY);
    if (savedId) return; // manual preference takes priority
    const { cities } = get();
    const city = cities.find((c) => c.name === cityName);
    if (city) set({ activeCity: city });
  },

  // Called from the map tab after GPS permission is granted.
  setUserLocation: (lat, lng) => set({ userLat: lat, userLng: lng }),

  setActiveCity: (city) => {
    SecureStore.setItemAsync(CITY_STORE_KEY, String(city.id));
    set({ activeCity: city });
  },
}));
