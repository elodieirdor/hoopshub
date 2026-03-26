import React, { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocationStore } from '@/store/locationStore';
import { City } from '@/types';

interface CityPickerProps {
  value?: string;
  onChange: (city: City) => void;
  variant?: 'field' | 'row';
  placeholder?: string;
}

export function CityPicker({
  value,
  onChange,
  variant = 'field',
  placeholder = 'City (optional)',
}: CityPickerProps) {
  const [open, setOpen] = useState(false);
  const { cities } = useLocationStore();

  const trigger =
    variant === 'row' ? (
      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center justify-between px-4 py-3"
      >
        <View className="flex-row items-center gap-2">
          <Ionicons name="location-outline" size={16} color="#7A7870" />
          <Text className="text-cream font-sans text-sm">{value ?? placeholder}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#7A7870" />
      </Pressable>
    ) : (
      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center justify-between h-12 rounded-xl px-4"
        style={{
          backgroundColor: '#181818',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      >
        <Text
          className={value ? 'text-cream font-sans text-base' : 'text-muted font-sans text-base'}
        >
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#7A7870" />
      </Pressable>
    );

  return (
    <>
      {trigger}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable
          style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}
          onPress={() => setOpen(false)}
        >
          <Pressable onPress={() => {}}>
            <View
              style={{
                backgroundColor: '#181818',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.08)',
                overflow: 'hidden',
              }}
            >
              <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
                <View
                  style={{
                    width: 36,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                  }}
                />
              </View>
              <Text
                style={{
                  fontFamily: 'BebasNeue_400Regular',
                  fontSize: 20,
                  color: '#F0EDE8',
                  paddingHorizontal: 20,
                  paddingBottom: 12,
                }}
              >
                SELECT CITY
              </Text>
              <FlatList
                data={cities}
                keyExtractor={(c) => String(c.id)}
                style={{ maxHeight: 320 }}
                renderItem={({ item }: { item: City }) => {
                  const active = item.name === value;
                  return (
                    <Pressable
                      onPress={() => {
                        onChange(item);
                        setOpen(false);
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingHorizontal: 20,
                        paddingVertical: 16,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: 'DMSans_400Regular',
                          fontSize: 16,
                          color: active ? '#FF5C00' : '#F0EDE8',
                        }}
                      >
                        {item.name}
                      </Text>
                      {active && <Ionicons name="checkmark" size={18} color="#FF5C00" />}
                    </Pressable>
                  );
                }}
                ItemSeparatorComponent={() => (
                  <View
                    style={{
                      height: 1,
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      marginHorizontal: 20,
                    }}
                  />
                )}
              />
              <Pressable
                onPress={() => setOpen(false)}
                style={{
                  alignItems: 'center',
                  paddingVertical: 16,
                  borderTopWidth: 1,
                  borderTopColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 16, color: '#7A7870' }}>
                  Cancel
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
