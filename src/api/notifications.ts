import client from './client';

export const registerPushToken = async (push_token: string): Promise<void> => {
  await client.post('/push-tokens', { push_token });
};

export const deletePushToken = async (): Promise<void> => {
  await client.delete('/push-tokens');
};
