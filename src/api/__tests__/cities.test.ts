import { getCities } from '../cities';
import client from '../client';
import { makeCity } from '@/test/factories';

jest.mock('../client');

const mockedClient = client as jest.Mocked<typeof client>;

const chch = makeCity({ id: 1, name: 'Christchurch', slug: 'christchurch' });
const akl = makeCity({ id: 2, name: 'Auckland', slug: 'auckland', lat: -36.8485, lng: 174.7633 });
const syd = makeCity({ id: 3, name: 'Sydney', slug: 'sydney', lat: -33.8688, lng: 151.2093 });

describe('getCities', () => {
  it('flattens a single-country response into a flat array', async () => {
    mockedClient.get = jest.fn().mockResolvedValue({
      data: { data: { NZ: [chch, akl] } },
    });

    const result = await getCities();

    expect(result).toHaveLength(2);
    expect(result).toEqual([chch, akl]);
  });

  it('flattens multiple countries into one array', async () => {
    mockedClient.get = jest.fn().mockResolvedValue({
      data: { data: { NZ: [chch, akl], AU: [syd] } },
    });

    const result = await getCities();

    expect(result).toHaveLength(3);
    expect(result).toContainEqual(syd);
  });

  it('returns an empty array when data is empty', async () => {
    mockedClient.get = jest.fn().mockResolvedValue({
      data: { data: {} },
    });

    const result = await getCities();

    expect(result).toEqual([]);
  });

  it('calls GET /cities', async () => {
    mockedClient.get = jest.fn().mockResolvedValue({ data: { data: { NZ: [chch] } } });

    await getCities();

    expect(mockedClient.get).toHaveBeenCalledWith('/cities');
  });
});
