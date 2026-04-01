import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heading } from '@/components/ui/Heading';
import { storage } from '@/utils/storage';
import { requestPermissionAndGetToken } from '@/utils/notifications';
import { registerPushToken } from '@/api/notifications';

const PROMPT_SHOWN_KEY = 'notification_prompt_shown';
const NOTIF_ENABLED_KEY = 'notification_enabled';

const PREVIEW_ITEMS = [
  { icon: 'basketball-outline' as const, text: 'New game opening near you' },
  { icon: 'person-add-outline' as const, text: 'Someone invited you to their run' },
  { icon: 'time-outline' as const, text: 'Your game starts in 1 hour' },
];

export default function NotificationsOptInScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { bottom, top } = useSafeAreaInsets();

  const handleEnable = async () => {
    setIsLoading(true);
    try {
      const token = await requestPermissionAndGetToken();
      if (token) {
        await registerPushToken(token);
        await storage.set(NOTIF_ENABLED_KEY, 'true');
      }
    } catch {
      // API failure is non-fatal — proceed to app
    } finally {
      await storage.set(PROMPT_SHOWN_KEY, 'true');
      setIsLoading(false);
      router.replace('/(tabs)');
    }
  };

  const handleSkip = async () => {
    await storage.set(NOTIF_ENABLED_KEY, 'false');
    await storage.set(PROMPT_SHOWN_KEY, 'true');
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1 bg-dark" style={{ paddingTop: top, paddingBottom: bottom + 24 }}>
      {/* Hero */}
      <View className="flex-1 items-center justify-center px-8">
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: 'rgba(255,92,0,0.15)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
          }}
        >
          <Ionicons name="notifications" size={44} color="#FF5C00" />
        </View>

        <Heading level={1} className="text-center mb-4">
          STAY IN THE GAME
        </Heading>

        <Text className="text-muted font-sans text-center text-base" style={{ lineHeight: 24 }}>
          Get notified when a run opens near you, when someone invites you to play, and when your
          games are about to start.
        </Text>
      </View>

      {/* Preview bullets */}
      <View className="px-8 mb-10" style={{ gap: 14 }}>
        {PREVIEW_ITEMS.map(({ icon, text }) => (
          <View key={text} className="flex-row items-center" style={{ gap: 12 }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: 'rgba(255,92,0,0.1)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name={icon} size={16} color="#FF5C00" />
            </View>
            <Text className="text-cream font-sans text-sm flex-1">{text}</Text>
          </View>
        ))}
      </View>

      {/* CTAs */}
      <View className="px-6" style={{ gap: 12 }}>
        <Pressable
          className="bg-orange rounded-xl py-4 items-center"
          onPress={handleEnable}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#F0EDE8" />
          ) : (
            <Text className="text-cream font-sans font-semibold text-base">
              Enable Notifications
            </Text>
          )}
        </Pressable>

        <Pressable onPress={handleSkip} disabled={isLoading} className="items-center py-3">
          <Text className="text-muted font-sans text-sm">Maybe Later</Text>
        </Pressable>
      </View>
    </View>
  );
}
