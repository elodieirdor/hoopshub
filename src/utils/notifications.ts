import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { storage } from './storage';

const PUSH_TOKEN_STORAGE_KEY = 'expo_push_token';

// Requests OS permission and returns the Expo push token, or null if denied / web
export async function requestPermissionAndGetToken(): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  // Use cached token to avoid redundant Expo API calls
  const cached = await storage.get(PUSH_TOKEN_STORAGE_KEY);
  if (cached) return cached;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

  if (!projectId) {
    if (__DEV__)
      console.warn('[notifications] Missing EAS projectId in app.json — push token unavailable');
    return null;
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
  await storage.set(PUSH_TOKEN_STORAGE_KEY, token);
  return token;
}
