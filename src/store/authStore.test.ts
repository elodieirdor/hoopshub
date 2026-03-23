import { useAuthStore } from './authStore';
import * as authApi from '../api/auth';
import { storage } from '../utils/storage';
import { router } from 'expo-router';

jest.mock('../api/auth');
jest.mock('../utils/storage');
jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));

const mockedAuthApi = jest.mocked(authApi);
const mockedStorage = storage as jest.Mocked<typeof storage>;
const mockedRouter = router as jest.Mocked<typeof router>;

const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  username: 'testuser',
  city: 'Christchurch',
  position: 'Guard' as const,
  skill_level: 'intermediate' as const,
  avatar_url: null,
  games_played: 0,
  avg_rating: 0,
};

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({ user: null, token: null, isLoading: true, isAuthenticated: false });
});

describe('loadUser', () => {
  it('sets isLoading false when no token in storage', async () => {
    mockedStorage.get.mockResolvedValue(null);

    await useAuthStore.getState().loadUser();
    const state = useAuthStore.getState();

    expect(state.isLoading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it('authenticates when token and /me succeed', async () => {
    mockedStorage.get.mockResolvedValue('tok_abc');
    mockedAuthApi.me.mockResolvedValue(mockUser);

    await useAuthStore.getState().loadUser();
    const state = useAuthStore.getState();

    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe('tok_abc');
    expect(state.user).toEqual(mockUser);
    expect(state.isLoading).toBe(false);
  });

  it('clears the token and sets isLoading false when /me throws', async () => {
    mockedStorage.get.mockResolvedValue('tok_bad');
    mockedAuthApi.me.mockRejectedValue(new Error('Unauthorized'));

    await useAuthStore.getState().loadUser();
    const state = useAuthStore.getState();

    expect(mockedStorage.delete).toHaveBeenCalledWith('auth_token');
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
  });
});

describe('login', () => {
  it('sets user, token and isAuthenticated on success', async () => {
    mockedAuthApi.login.mockResolvedValue({ token: 'tok_123', user: mockUser });

    await useAuthStore.getState().login('test@example.com', 'password');
    const state = useAuthStore.getState();

    expect(mockedStorage.set).toHaveBeenCalledWith('auth_token', 'tok_123');
    expect(state.token).toBe('tok_123');
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it('propagates errors without changing state', async () => {
    mockedAuthApi.login.mockRejectedValue(new Error('Invalid credentials'));

    await expect(useAuthStore.getState().login('bad@example.com', 'wrong')).rejects.toThrow(
      'Invalid credentials',
    );

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });
});

describe('logout', () => {
  it('clears state, deletes token and redirects to login', async () => {
    useAuthStore.setState({ user: mockUser as any, token: 'tok_123', isAuthenticated: true });
    mockedAuthApi.logout.mockResolvedValue(undefined);

    await useAuthStore.getState().logout();
    const state = useAuthStore.getState();

    expect(mockedStorage.delete).toHaveBeenCalledWith('auth_token');
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(mockedRouter.replace).toHaveBeenCalledWith('/(auth)/login');
  });
});
