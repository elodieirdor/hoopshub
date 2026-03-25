import client from '@/api/client';
import { City } from '@/types';

export const getCities = async (): Promise<City[]> => {
  const res = await client.get<{ data: Record<string, City[]> }>('/cities');
  return Object.values(res.data.data).flat();
};
