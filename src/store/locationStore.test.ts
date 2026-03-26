import { useLocationStore } from './locationStore';
import { getCities } from '@/api/cities';
import * as SecureStore from 'expo-secure-store';
import { makeCity } from '@/test/factories';

jest.mock('@/api/cities');
jest.mock('expo-secure-store');

const mockedGetCities = getCities as jest.MockedFunction<typeof getCities>;
const mockedSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

const christchurch = makeCity({ id: 1, name: 'Christchurch', slug: 'christchurch' });
const auckland = makeCity({
  id: 2,
  name: 'Auckland',
  slug: 'auckland',
  lat: -36.8485,
  lng: 174.7633,
});

const RESET = {
  userLat: null,
  userLng: null,
  activeCity: null,
  cities: [],
  locationReady: false,
};

beforeEach(() => {
  jest.clearAllMocks();
  useLocationStore.setState(RESET);
  mockedSecureStore.getItemAsync.mockResolvedValue(null);
  mockedSecureStore.setItemAsync.mockResolvedValue(undefined as any);
});

describe('init', () => {
  it('sets locationReady with no activeCity when getCities returns empty', async () => {
    mockedGetCities.mockResolvedValue([]);

    await useLocationStore.getState().init();

    expect(useLocationStore.getState().locationReady).toBe(true);
    expect(useLocationStore.getState().activeCity).toBeNull();
  });

  it('sets locationReady even when getCities throws', async () => {
    mockedGetCities.mockRejectedValue(new Error('Network error'));

    await useLocationStore.getState().init();

    expect(useLocationStore.getState().locationReady).toBe(true);
    expect(useLocationStore.getState().activeCity).toBeNull();
  });

  it('uses the SecureStore-saved city (priority 1)', async () => {
    mockedGetCities.mockResolvedValue([christchurch, auckland]);
    mockedSecureStore.getItemAsync.mockResolvedValue('2'); // Auckland

    await useLocationStore.getState().init();

    expect(useLocationStore.getState().activeCity).toEqual(auckland);
    expect(useLocationStore.getState().locationReady).toBe(true);
  });

  it('falls back to Christchurch when no SecureStore entry', async () => {
    mockedGetCities.mockResolvedValue([christchurch, auckland]);

    await useLocationStore.getState().init();

    expect(useLocationStore.getState().activeCity).toEqual(christchurch);
    expect(useLocationStore.getState().locationReady).toBe(true);
  });

  it('falls back to first city when Christchurch is not in the list', async () => {
    mockedGetCities.mockResolvedValue([auckland]);

    await useLocationStore.getState().init();

    expect(useLocationStore.getState().activeCity).toEqual(auckland);
  });

  it('ignores an unknown SecureStore id and falls back to default', async () => {
    mockedGetCities.mockResolvedValue([christchurch, auckland]);
    mockedSecureStore.getItemAsync.mockResolvedValue('999');

    await useLocationStore.getState().init();

    expect(useLocationStore.getState().activeCity).toEqual(christchurch);
  });
});

describe('syncCityWithUser', () => {
  beforeEach(() => {
    useLocationStore.setState({ ...RESET, cities: [christchurch, auckland] });
  });

  it('sets activeCity from user profile when no SecureStore preference', async () => {
    await useLocationStore.getState().syncCityWithUser('Auckland');

    expect(useLocationStore.getState().activeCity).toEqual(auckland);
  });

  it('does not override a SecureStore preference', async () => {
    useLocationStore.setState({
      ...RESET,
      cities: [christchurch, auckland],
      activeCity: christchurch,
    });
    mockedSecureStore.getItemAsync.mockResolvedValue('1');

    await useLocationStore.getState().syncCityWithUser('Auckland');

    expect(useLocationStore.getState().activeCity).toEqual(christchurch);
  });

  it('does nothing when cityName is null', async () => {
    await useLocationStore.getState().syncCityWithUser(null);

    expect(useLocationStore.getState().activeCity).toBeNull();
  });

  it('does nothing when cityName is empty string', async () => {
    await useLocationStore.getState().syncCityWithUser('');

    expect(useLocationStore.getState().activeCity).toBeNull();
  });

  it('does nothing when city is not in the loaded list', async () => {
    await useLocationStore.getState().syncCityWithUser('Wellington');

    expect(useLocationStore.getState().activeCity).toBeNull();
  });
});

describe('setActiveCity', () => {
  it('updates activeCity in state', () => {
    useLocationStore.getState().setActiveCity(auckland);

    expect(useLocationStore.getState().activeCity).toEqual(auckland);
  });

  it('persists the city id to SecureStore', () => {
    useLocationStore.getState().setActiveCity(auckland);

    expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith('active_city_id', '2');
  });
});

describe('setUserLocation', () => {
  it('updates userLat and userLng', () => {
    useLocationStore.getState().setUserLocation(-36.8485, 174.7633);

    const { userLat, userLng } = useLocationStore.getState();
    expect(userLat).toBe(-36.8485);
    expect(userLng).toBe(174.7633);
  });
});
