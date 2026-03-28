import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, TextInput, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchInvitable, sendInvitation } from '@/api/invitations';
import { User } from '@/types';
import { initials, SKILL_COLORS } from '@/utils/formatters';

interface Props {
  gameId: number;
  visible: boolean;
  onClose: () => void;
  onInvited: () => void;
}

export function InvitePlayerModal({ gameId, visible, onClose, onInvited }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [invitedIds, setInvitedIds] = useState<Set<number>>(new Set());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) {
      setQuery('');
      setResults([]);
      setInvitedIds(new Set());
    }
  }, [visible]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchInvitable(gameId, query);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, gameId]);

  const handleInvite = async (user: User) => {
    try {
      await sendInvitation(gameId, user.id);
      setInvitedIds((prev) => new Set(prev).add(user.id));
      onInvited();
    } catch (e) {
      console.error(e);
      // silent — user stays in list if invite fails
    }
  };

  const visibleResults = results.filter((u) => !invitedIds.has(u.id));
  const showEmpty = query.length >= 2 && !loading && visibleResults.length === 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
        onPress={onClose}
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
              paddingBottom: 40,
            }}
          >
            {/* Handle */}
            <View className="items-center pt-3 pb-2">
              <View className="w-9 h-1 rounded-full bg-white/20" />
            </View>

            <Text
              style={{
                fontFamily: 'BebasNeue_400Regular',
                fontSize: 22,
                color: '#F0EDE8',
                marginBottom: 16,
              }}
            >
              INVITE A PLAYER
            </Text>

            {/* Search input */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#202020',
                borderRadius: 10,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.08)',
                paddingHorizontal: 12,
                gap: 8,
                marginBottom: 12,
              }}
            >
              <Ionicons name="search-outline" size={16} color="#7A7870" />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search by name..."
                placeholderTextColor="#7A7870"
                style={{
                  flex: 1,
                  color: '#F0EDE8',
                  fontFamily: 'DMSans',
                  fontSize: 14,
                  paddingVertical: 12,
                }}
                autoCorrect={false}
                autoCapitalize="none"
              />
            </View>

            {/* Loading */}
            {loading && (
              <View className="items-center py-4">
                <ActivityIndicator color="#FF5C00" />
              </View>
            )}

            {/* Results */}
            {!loading && visibleResults.length > 0 && (
              <FlatList
                data={visibleResults}
                keyExtractor={(u) => String(u.id)}
                scrollEnabled={false}
                ItemSeparatorComponent={() => (
                  <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />
                )}
                renderItem={({ item: user }) => {
                  const skillColor = SKILL_COLORS[user.skill_level] ?? '#7A7870';
                  return (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 10,
                        paddingVertical: 10,
                      }}
                    >
                      {/* Avatar */}
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: '#FF5C00',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text
                          style={{
                            color: '#F0EDE8',
                            fontFamily: 'DMSans',
                            fontSize: 11,
                            fontWeight: '600',
                          }}
                        >
                          {initials(user.name)}
                        </Text>
                      </View>

                      {/* Name + skill */}
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text
                          style={{
                            color: '#F0EDE8',
                            fontFamily: 'DMSans',
                            fontSize: 13,
                            fontWeight: '600',
                          }}
                        >
                          {user.name}
                        </Text>
                        <View
                          style={{
                            alignSelf: 'flex-start',
                            backgroundColor: skillColor + '33',
                            borderRadius: 4,
                            paddingHorizontal: 6,
                            paddingVertical: 1,
                          }}
                        >
                          <Text style={{ color: skillColor, fontFamily: 'DMSans', fontSize: 10 }}>
                            {user.skill_level}
                          </Text>
                        </View>
                      </View>

                      {/* Invite button */}
                      <Pressable
                        onPress={() => handleInvite(user)}
                        style={{
                          backgroundColor: '#FF5C00',
                          borderRadius: 8,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                        }}
                      >
                        <Text
                          style={{
                            color: '#F0EDE8',
                            fontFamily: 'DMSans',
                            fontSize: 12,
                            fontWeight: '600',
                          }}
                        >
                          Invite
                        </Text>
                      </Pressable>
                    </View>
                  );
                }}
              />
            )}

            {/* Empty state */}
            {showEmpty && (
              <View className="items-center py-6">
                <Text style={{ color: '#7A7870', fontFamily: 'DMSans', fontSize: 13 }}>
                  No players found
                </Text>
              </View>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
