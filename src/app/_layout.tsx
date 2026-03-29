import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFonts } from 'expo-font';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import {
  DMSans_400Regular,
  DMSans_400Regular_Italic,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from '@expo-google-fonts/dm-sans';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useLocationStore } from '@/store/locationStore';
import { useAppUpdates } from '@/hooks/useAppUpdates';
import { UpdatePrompt } from '@/components/ui/UpdatePrompt';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1 },
    mutations: { retry: 0 },
  },
});

export const unstable_settings = {
  anchor: '(auth)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    DMSans_400Regular,
    DMSans_400Regular_Italic,
    DMSans_500Medium,
    DMSans_600SemiBold,
  });

  const { isAuthenticated, isLoading, loadUser } = useAuthStore();
  const initLocation = useLocationStore((s) => s.init);
  const { updateState, openStore, applyOta, dismissOta } = useAppUpdates();

  useEffect(() => {
    loadUser();
    initLocation();
  }, [loadUser, initLocation]);

  useEffect(() => {
    if (!fontsLoaded || isLoading) return;
    SplashScreen.hideAsync();
    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/login');
    }
  }, [fontsLoaded, isLoading, isAuthenticated]);

  if (!fontsLoaded || isLoading) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: '#0A0A0A' },
              headerTintColor: '#F0EDE8',
              headerTitleStyle: { fontFamily: 'BebasNeue_400Regular', fontSize: 20 },
              headerShadowVisible: false,
              headerBackButtonDisplayMode: 'minimal',
              title: 'Loading...',
            }}
          >
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="courts/[id]" />
            <Stack.Screen name="courts/edit" options={{ title: 'Edit court' }} />
          </Stack>
          <StatusBar style="auto" />
          {updateState.status === 'store-required' && (
            <UpdatePrompt variant="store" onUpdate={openStore} />
          )}
          {updateState.status === 'ota-ready' && (
            <UpdatePrompt variant="ota" onRestart={applyOta} onDismiss={dismissOta} />
          )}
        </ThemeProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
