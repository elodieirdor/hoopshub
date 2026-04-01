import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { InvitationsInbox } from '@/components/invitations/InvitationsInbox';
import UpcomingGames from '@/components/games/UpcomingGames';
import AllGames from '@/components/games/AllGames';
import { router } from 'expo-router';
import { Heading } from '@/components/ui/Heading';
import { Ionicons } from '@expo/vector-icons';

const OPTIONS = [
  {
    icon: 'basketball-outline' as const,
    title: 'Organise a game',
    description: 'Set a time, court, and invite players',
    route: '/games/create',
  },
  {
    icon: 'flash-outline' as const,
    title: 'Need a sub?',
    description: 'Find someone to fill a spot fast',
    route: '/games/create?type=sub_needed',
  },
];

export default function GamesScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (route: string) => {
    setModalVisible(false);
    router.push(route as any);
  };

  return (
    <View className="flex-1">
      <View className="flex-1 bg-dark" style={{ paddingTop: top, paddingBottom: bottom }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
          <Heading>PICKUP GAMES</Heading>
          <Pressable
            onPress={() => setModalVisible(true)}
            className="bg-orange rounded-lg px-3 py-2"
          >
            <Text className="text-cream font-sans font-semibold text-sm">Post game</Text>
          </Pressable>
        </View>

        <ScrollView>
          <UpcomingGames />

          <InvitationsInbox />

          <AllGames onPressPostGames={() => setModalVisible(true)} />
        </ScrollView>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onPress={() => setModalVisible(false)}
        >
          <Pressable onPress={() => {}}>
            <View
              className="bg-surface border border-border rounded-t-[20px] px-4 pt-3"
              style={{ paddingBottom: bottom }}
            >
              {/* Handle */}
              <View
                className="w-9 h-1 rounded-sm self-center mb-5"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              />

              <Heading level={2} style={{ marginBottom: 16 }}>
                WHAT DO YOU NEED?
              </Heading>

              <View className="gap-3">
                {OPTIONS.map((option) => (
                  <Pressable
                    key={option.title}
                    onPress={() => handleSelect(option.route)}
                    className="bg-surface-2 rounded-xl border border-border p-4 flex-row items-center gap-[14px]"
                  >
                    <View
                      className="w-11 h-11 rounded-full items-center justify-center"
                      style={{ backgroundColor: 'rgba(255,92,0,0.12)' }}
                    >
                      <Ionicons name={option.icon} size={22} color="#FF5C00" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-cream font-sans font-semibold text-base">
                        {option.title}
                      </Text>
                      <Text className="text-muted font-sans text-[13px] mt-0.5">
                        {option.description}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#7A7870" />
                  </Pressable>
                ))}
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
