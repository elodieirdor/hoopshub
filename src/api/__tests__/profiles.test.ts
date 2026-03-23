import { getProfile, updateProfile, getPublicProfile, searchInvitable } from '../profiles';
import client from '../client';
import { User, PublicProfile } from '@/types';

jest.mock('../client');

const mockedClient = client as jest.Mocked<typeof client>;

const mockUser: User = {
  id: 5,
  name: 'Sam Hooper',
  username: 'samhooper',
  city: 'Christchurch',
  position: 'Guard',
  skill_level: 'advanced',
  avatar_url: null,
  games_played: 12,
  avg_rating: 4.5,
};

const mockPublicProfile: PublicProfile = {
  ...mockUser,
  hosted_count: 3,
  member_since: 'Mar 2026',
  ratings: {
    punctuality: 4.2,
    sportsmanship: 4.8,
    skill_accuracy: 4.0,
    fun_to_play: 5.0,
  },
  recent_games: [],
};

describe('getProfile', () => {
  it('fetches a user by id', async () => {
    mockedClient.get = jest.fn().mockResolvedValue({ data: mockUser });

    const result = await getProfile(5);

    expect(mockedClient.get).toHaveBeenCalledWith('/users/5');
    expect(result).toEqual(mockUser);
  });
});

describe('updateProfile', () => {
  it('sends a PUT request with partial data', async () => {
    const updated = { ...mockUser, city: 'Auckland' };
    mockedClient.put = jest.fn().mockResolvedValue({ data: updated });

    const result = await updateProfile(5, { city: 'Auckland' });

    expect(mockedClient.put).toHaveBeenCalledWith('/users/5', { city: 'Auckland' });
    expect(result.city).toBe('Auckland');
  });
});

describe('getPublicProfile', () => {
  it('fetches a public profile with ratings and recent_games', async () => {
    mockedClient.get = jest.fn().mockResolvedValue({ data: mockPublicProfile });

    const result = await getPublicProfile(5);

    expect(mockedClient.get).toHaveBeenCalledWith('/users/5');
    expect(result.hosted_count).toBe(3);
    expect(result.member_since).toBe('Mar 2026');
    expect(result.ratings.punctuality).toBe(4.2);
    expect(result.ratings.sportsmanship).toBe(4.8);
    expect(result.recent_games).toEqual([]);
  });
});

describe('searchInvitable', () => {
  it('passes gameId and query to the invitable endpoint', async () => {
    mockedClient.get = jest.fn().mockResolvedValue({ data: [mockUser] });

    const result = await searchInvitable(42, 'sam');

    expect(mockedClient.get).toHaveBeenCalledWith('/games/42/invitable', { params: { q: 'sam' } });
    expect(result).toEqual([mockUser]);
  });

  it('returns empty array when no users match', async () => {
    mockedClient.get = jest.fn().mockResolvedValue({ data: [] });

    const result = await searchInvitable(42, 'xyz');

    expect(result).toEqual([]);
  });
});
