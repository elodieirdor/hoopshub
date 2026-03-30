import { getCourts, getCourt, addToFavorite, destroyFavorite } from '../courts';
import client from '../client';
import { makeCourt } from '@/test/factories';

jest.mock('../client');

const mockedClient = client as jest.Mocked<typeof client>;

const mockCourt = makeCourt();

describe('getCourts', () => {
  it('fetches courts without params', async () => {
    mockedClient.get = jest.fn().mockResolvedValue({ data: [mockCourt] });

    const result = await getCourts();

    expect(mockedClient.get).toHaveBeenCalledWith('/courts', { params: undefined });
    expect(result).toEqual([mockCourt]);
  });

  it('passes lat/lng params', async () => {
    mockedClient.get = jest.fn().mockResolvedValue({ data: [mockCourt] });

    const result = await getCourts({ lat: -43.5321, lng: 172.6362 });

    expect(mockedClient.get).toHaveBeenCalledWith('/courts', {
      params: { lat: -43.5321, lng: 172.6362 },
    });
    expect(result).toEqual([mockCourt]);
  });

  it('passes filter params', async () => {
    mockedClient.get = jest.fn().mockResolvedValue({ data: [] });

    await getCourts({ lat: -36.8485, lng: 174.7633, lit: true, is_free: false });

    expect(mockedClient.get).toHaveBeenCalledWith('/courts', {
      params: { lat: -36.8485, lng: 174.7633, lit: true, is_free: false },
    });
  });

  it('returns empty array when no courts found', async () => {
    mockedClient.get = jest.fn().mockResolvedValue({ data: [] });

    const result = await getCourts({ lat: -999, lng: -999 });

    expect(result).toEqual([]);
  });
});

describe('getCourt', () => {
  it('fetches a single court by id', async () => {
    mockedClient.get = jest.fn().mockResolvedValue({ data: mockCourt });

    const result = await getCourt(1);

    expect(mockedClient.get).toHaveBeenCalledWith('/courts/1');
    expect(result).toEqual(mockCourt);
  });
});

describe('addToFavorite', () => {
  it('posts to the favorite endpoint and returns the response', async () => {
    mockedClient.post = jest.fn().mockResolvedValue({ data: { favorited: true } });

    const result = await addToFavorite(42);

    expect(mockedClient.post).toHaveBeenCalledWith('/courts/42/favorite');
    expect(result).toEqual({ favorited: true });
  });
});

describe('destroyFavorite', () => {
  it('deletes the favorite and returns the response', async () => {
    mockedClient.delete = jest.fn().mockResolvedValue({ data: { favorited: false } });

    const result = await destroyFavorite(42);

    expect(mockedClient.delete).toHaveBeenCalledWith('/courts/42/favorite');
    expect(result).toEqual({ favorited: false });
  });
});
