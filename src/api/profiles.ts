import client from './client';
import {Profile} from "@/types";

export const getProfile = async (id: number) => {
  const res = await client.get<Profile>(`/profiles/${id}`);
  return res.data;
};

export const updateProfile = async (id: number, data: Partial<Profile>) => {
  const res = await client.put<Profile>(`/profiles/${id}`, data);
  return res.data;
};
