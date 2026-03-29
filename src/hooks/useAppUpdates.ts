import { useState, useEffect, useCallback } from 'react';
import { Platform, Linking } from 'react-native';
import * as Updates from 'expo-updates';
import Constants from 'expo-constants';
import { fetchAppVersionConfig } from '@/api/appVersion';
import { isUpdateRequired } from '@/utils/version';

export type UpdateState =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'store-required'; storeUrl: string }
  | { status: 'ota-ready' }
  | { status: 'done' };

interface UseAppUpdatesReturn {
  updateState: UpdateState;
  openStore: () => void;
  applyOta: () => Promise<void>;
  dismissOta: () => void;
}

export function useAppUpdates(): UseAppUpdatesReturn {
  const [updateState, setUpdateState] = useState<UpdateState>({ status: 'idle' });

  const checkUpdates = useCallback(async () => {
    // Skip in development — expo-updates APIs are non-functional in Expo Go and dev builds
    if (__DEV__) {
      setUpdateState({ status: 'done' });
      return;
    }

    setUpdateState({ status: 'checking' });

    const installedVersion = Constants.expoConfig?.version ?? '0.0.0';

    // Run both checks concurrently — neither blocks the other
    const [versionConfigResult, otaResult] = await Promise.allSettled([
      fetchAppVersionConfig(),
      Updates.checkForUpdateAsync(),
    ]);

    // --- Store update check (takes priority) ---
    if (versionConfigResult.status === 'fulfilled') {
      const { minimum_version, android_store_url, ios_store_url } = versionConfigResult.value;

      if (isUpdateRequired(installedVersion, minimum_version)) {
        const androidPackage = Constants.expoConfig?.android?.package;
        const iosBundleId = Constants.expoConfig?.ios?.bundleIdentifier;
        const fallbackStoreUrl =
          Platform.OS === 'ios'
            ? `https://apps.apple.com/app/${iosBundleId}`
            : `https://play.google.com/store/apps/details?id=${androidPackage}`;

        const storeUrl =
          (Platform.OS === 'ios' ? ios_store_url : android_store_url) ?? fallbackStoreUrl;

        setUpdateState({ status: 'store-required', storeUrl });
        return;
      }
    }
    // If version check fails (offline, server down), fall through silently — never block launch

    // --- OTA update check ---
    if (otaResult.status === 'fulfilled' && otaResult.value.isAvailable) {
      try {
        await Updates.fetchUpdateAsync();
        setUpdateState({ status: 'ota-ready' });
        return;
      } catch {
        // OTA fetch failed — swallow silently
      }
    }

    setUpdateState({ status: 'done' });
  }, []);

  useEffect(() => {
    checkUpdates();
  }, [checkUpdates]);

  const openStore = useCallback(() => {
    if (updateState.status !== 'store-required') return;
    Linking.openURL(updateState.storeUrl);
  }, [updateState]);

  const applyOta = useCallback(async () => {
    await Updates.reloadAsync();
  }, []);

  const dismissOta = useCallback(() => {
    setUpdateState({ status: 'done' });
  }, []);

  return { updateState, openStore, applyOta, dismissOta };
}
