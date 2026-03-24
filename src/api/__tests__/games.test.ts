import { getGames, joinGame, leaveGame, deleteGame } from '../games';
import client from '../client';
import { makeGame, makeCourt, makeUser } from '@/test/factories';

jest.mock('../client');

const mockedClient = client as jest.Mocked<typeof client>;

const mockGame = makeGame({
  id: 42,
  host_id: 99,
  host: makeUser({ id: 99, username: 'ballerNZ', name: 'Alex Baller' }),
  court: makeCourt({ id: 1 }),
  description: '5v5 at Cowles',
});

describe('getGames', () => {
  it('fetches games without params', async () => {
    mockedClient.get = jest.fn().mockResolvedValue({ data: [mockGame] });

    const result = await getGames();

    expect(mockedClient.get).toHaveBeenCalledWith('/games', { params: undefined });
    expect(result).toEqual([mockGame]);
  });

  it('passes court_id param', async () => {
    mockedClient.get = jest.fn().mockResolvedValue({ data: [mockGame] });

    await getGames({ court_id: 1 });

    expect(mockedClient.get).toHaveBeenCalledWith('/games', { params: { court_id: 1 } });
  });

  it('passes city and skill_level params', async () => {
    mockedClient.get = jest.fn().mockResolvedValue({ data: [] });

    await getGames({ city: 'Christchurch', skill_level: 'beginner' });

    expect(mockedClient.get).toHaveBeenCalledWith('/games', {
      params: { city: 'Christchurch', skill_level: 'beginner' },
    });
  });
});

describe('joinGame', () => {
  it('posts to the players endpoint', async () => {
    mockedClient.post = jest.fn().mockResolvedValue({ data: { success: true } });

    const result = await joinGame(42);

    expect(mockedClient.post).toHaveBeenCalledWith('/games/42/players');
    expect(result).toEqual({ success: true });
  });
});

describe('leaveGame', () => {
  it('sends a DELETE to the players endpoint', async () => {
    mockedClient.delete = jest.fn().mockResolvedValue({});

    await leaveGame(42);

    expect(mockedClient.delete).toHaveBeenCalledWith('/games/42/players');
  });
});

describe('deleteGame', () => {
  it('sends a DELETE request', async () => {
    mockedClient.delete = jest.fn().mockResolvedValue({});

    await deleteGame(42);

    expect(mockedClient.delete).toHaveBeenCalledWith('/games/42');
  });
});
