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
    <View style={{ flex: 1 }}>
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

          <AllGames />
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
              style={{
                backgroundColor: '#181818',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.08)',
                paddingHorizontal: 20,
                paddingBottom: bottom + 24,
                paddingTop: 12,
              }}
            >
              {/* Handle */}
              <View
                style={{
                  width: 36,
                  height: 4,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: 2,
                  alignSelf: 'center',
                  marginBottom: 20,
                }}
              />

              <Heading level={2} style={{ marginBottom: 16 }}>WHAT DO YOU NEED?</Heading>

              <View style={{ gap: 12 }}>
                {OPTIONS.map((option) => (
                  <Pressable
                    key={option.title}
                    onPress={() => handleSelect(option.route)}
                    style={({ pressed }) => ({
                      backgroundColor: pressed ? '#202020' : '#202020',
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.08)',
                      padding: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 14,
                    })}
                  >
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: 'rgba(255,92,0,0.12)',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name={option.icon} size={22} color="#FF5C00" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#F0EDE8', fontFamily: 'DMSans', fontWeight: '600', fontSize: 16 }}>
                        {option.title}
                      </Text>
                      <Text style={{ color: '#7A7870', fontFamily: 'DMSans', fontSize: 13, marginTop: 2 }}>
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
