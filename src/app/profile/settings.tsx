import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Switch, ActivityIndicator } from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useAuthStore } from '@/store/authStore';
import { storage } from '@/utils/storage';
import { requestPermissionAndGetToken } from '@/utils/notifications';
import { registerPushToken, deletePushToken } from '@/api/notifications';

function SettingsRow({
  icon,
  label,
  onPress,
  destructive = false,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  const color = destructive ? '#EF4444' : '#F0EDE8';
  const iconColor = destructive ? '#EF4444' : '#7A7870';
  return (
    <Pressable onPress={onPress} className="flex-row items-center px-4 py-4 bg-surface">
      <Ionicons name={icon} size={18} color={iconColor} style={{ marginRight: 12 }} />
      <Text className="flex-1 font-sans text-sm" style={{ color }}>
        {label}
      </Text>
      {!destructive && <Ionicons name="chevron-forward" size={16} color="#7A7870" />}
    </Pressable>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <View
      className="rounded-xl overflow-hidden"
      style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}
    >
      {children}
    </View>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />;
}

export default function SettingsScreen() {
  const { bottom } = useSafeAreaInsets();
  const logout = useAuthStore((s) => s.logout);
  const version = Constants.expoConfig?.version ?? '—';

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notifLoading, setNotifLoading] = useState(true);

  useEffect(() => {
    storage.get('notification_enabled').then((val) => {
      setNotificationsEnabled(val === 'true');
      setNotifLoading(false);
    });
  }, []);

  const handleNotificationToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    try {
      if (value) {
        const token = await requestPermissionAndGetToken();
        if (token) {
          await registerPushToken(token);
          await storage.set('notification_enabled', 'true');
        } else {
          setNotificationsEnabled(false);
          Alert.alert(
            'Notifications blocked',
            'Enable notifications for HoopsHub in your device Settings.',
          );
        }
      } else {
        await deletePushToken();
        await storage.set('notification_enabled', 'false');
      }
    } catch {
      setNotificationsEnabled(!value);
      Alert.alert('Error', 'Could not update notification settings. Try again.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <View className="flex-1 bg-dark">
      <Stack.Screen options={{ title: 'SETTINGS' }} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: bottom + 32,
          gap: 24,
        }}
      >
        {/* Account */}
        <View style={{ gap: 8 }}>
          <Text
            className="text-muted font-sans text-xs uppercase"
            style={{ letterSpacing: 1, paddingLeft: 4 }}
          >
            Account
          </Text>
          <SectionCard>
            <SettingsRow
              icon="mail-outline"
              label="Change email"
              onPress={() => router.push('/profile/email')}
            />
            <Divider />
            <SettingsRow
              icon="lock-closed-outline"
              label="Change password"
              onPress={() => router.push('/profile/password')}
            />
          </SectionCard>
        </View>

        {/* Notifications */}
        <View style={{ gap: 8 }}>
          <Text
            className="text-muted font-sans text-xs uppercase"
            style={{ letterSpacing: 1, paddingLeft: 4 }}
          >
            Notifications
          </Text>
          <SectionCard>
            <View className="flex-row items-center px-4 py-4 bg-surface">
              <Ionicons
                name="notifications-outline"
                size={18}
                color="#7A7870"
                style={{ marginRight: 12 }}
              />
              <Text className="flex-1 text-cream font-sans text-sm">Push notifications</Text>
              {notifLoading ? (
                <ActivityIndicator size="small" color="#7A7870" />
              ) : (
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleNotificationToggle}
                  trackColor={{ false: '#202020', true: '#FF5C00' }}
                  thumbColor="#F0EDE8"
                />
              )}
            </View>
          </SectionCard>
        </View>

        {/* App */}
        <View style={{ gap: 8 }}>
          <Text
            className="text-muted font-sans text-xs uppercase"
            style={{ letterSpacing: 1, paddingLeft: 4 }}
          >
            App
          </Text>
          <SectionCard>
            <View className="flex-row items-center px-4 py-4 bg-surface">
              <Ionicons
                name="information-circle-outline"
                size={18}
                color="#7A7870"
                style={{ marginRight: 12 }}
              />
              <Text className="flex-1 text-cream font-sans text-sm">Version</Text>
              <Text className="text-muted font-sans text-sm">{version}</Text>
            </View>
          </SectionCard>
        </View>

        {/* Danger */}
        <View style={{ gap: 8 }}>
          <SectionCard>
            <SettingsRow
              icon="log-out-outline"
              label="Log out"
              onPress={handleLogout}
              destructive
            />
          </SectionCard>
        </View>
      </ScrollView>
    </View>
  );
}
