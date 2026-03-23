import { getCourts, getCourt } from '../courts';
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

  it('passes city param', async () => {
    mockedClient.get = jest.fn().mockResolvedValue({ data: [mockCourt] });

    const result = await getCourts({ city: 'Christchurch' });

    expect(mockedClient.get).toHaveBeenCalledWith('/courts', { params: { city: 'Christchurch' } });
    expect(result).toEqual([mockCourt]);
  });

  it('passes filter params', async () => {
    mockedClient.get = jest.fn().mockResolvedValue({ data: [] });

    await getCourts({ city: 'Auckland', lit: true, is_free: false });

    expect(mockedClient.get).toHaveBeenCalledWith('/courts', {
      params: { city: 'Auckland', lit: true, is_free: false },
    });
  });

  it('returns empty array when no courts found', async () => {
    mockedClient.get = jest.fn().mockResolvedValue({ data: [] });

    const result = await getCourts({ city: 'Nowhere' });

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
