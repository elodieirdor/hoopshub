export interface AppVersionConfig {
  minimum_version: string;
  android_store_url?: string;
  ios_store_url?: string;
}

export async function fetchAppVersionConfig(): Promise<AppVersionConfig> {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL;
  const response = await fetch(`${baseUrl}/app-version`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Version check failed: ${response.status}`);
  return response.json();
}
