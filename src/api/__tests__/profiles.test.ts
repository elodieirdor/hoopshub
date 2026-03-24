import {
  getUser,
  updateMe,
  updateEmail,
  updatePassword,
  uploadAvatar,
  searchInvitable,
} from '../users';
import client from '../client';
import { makeUser } from '@/test/factories';

jest.mock('../client');

const mockedClient = client as jest.Mocked<typeof client>;

const mockUser = makeUser({
  id: 5,
  name: 'Sam Hooper',
  position: 'Guard',
  skill_level: 'advanced',
  games_played: 12,
  avg_rating: 4.5,
  hosted_count: 3,
  member_since: 'Mar 2026',
  ratings: { punctuality: 4.2, sportsmanship: 4.8, skill_accuracy: 4.0, fun_to_play: 5.0 },
});

describe('getUser', () => {
  it('fetches a user by id', async () => {
    mockedClient.get = jest.fn().mockResolvedValue({ data: mockUser });

    const result = await getUser(5);

    expect(mockedClient.get).toHaveBeenCalledWith('/users/5');
    expect(result).toEqual(mockUser);
  });
});

describe('updateMe', () => {
  it('sends a PUT request to /me with partial data', async () => {
    const updated = { ...mockUser, city: 'Auckland' };
    mockedClient.put = jest.fn().mockResolvedValue({ data: updated });

    const result = await updateMe({ city: 'Auckland' });

    expect(mockedClient.put).toHaveBeenCalledWith('/me', { city: 'Auckland' });
    expect(result.city).toBe('Auckland');
  });
});

describe('getUser (public profile)', () => {
  it('fetches a public profile with ratings and recent_games', async () => {
    mockedClient.get = jest.fn().mockResolvedValue({ data: mockUser });

    const result = await getUser(5);

    expect(mockedClient.get).toHaveBeenCalledWith('/users/5');
    expect(result.hosted_count).toBe(3);
    expect(result.member_since).toBe('Mar 2026');
    expect(result.ratings.punctuality).toBe(4.2);
    expect(result.ratings.sportsmanship).toBe(4.8);
    expect(result.recent_games).toEqual([]);
  });
});

describe('updateEmail', () => {
  it('sends a PUT to /me/email and returns updated user', async () => {
    const updated = { ...mockUser };
    mockedClient.put = jest.fn().mockResolvedValue({ data: updated });

    const result = await updateEmail({ email: 'new@example.com', current_password: 'secret' });

    expect(mockedClient.put).toHaveBeenCalledWith('/me/email', {
      email: 'new@example.com',
      current_password: 'secret',
    });
    expect(result).toEqual(updated);
  });
});

describe('updatePassword', () => {
  it('sends a PUT to /me/password', async () => {
    mockedClient.put = jest.fn().mockResolvedValue({ data: undefined });

    await updatePassword({
      current_password: 'old',
      password: 'newpass1',
      password_confirmation: 'newpass1',
    });

    expect(mockedClient.put).toHaveBeenCalledWith('/me/password', {
      current_password: 'old',
      password: 'newpass1',
      password_confirmation: 'newpass1',
    });
  });
});

describe('uploadAvatar', () => {
  it('posts multipart/form-data to /me/avatar and returns updated user', async () => {
    const updated = { ...mockUser, avatar_url: 'https://cdn.example.com/avatar.jpg' };
    mockedClient.post = jest.fn().mockResolvedValue({ data: updated });

    const result = await uploadAvatar('file:///tmp/photo.jpg');

    expect(mockedClient.post).toHaveBeenCalledWith('/me/avatar', expect.any(FormData), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    expect(result.avatar_url).toBe('https://cdn.example.com/avatar.jpg');
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
