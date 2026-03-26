import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as ImagePicker from 'expo-image-picker';
import { useMutation } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { FormInput } from '@/components/ui/form-input';
import { updateMe, uploadAvatar } from '@/api/users';
import { initials } from '@/utils/formatters';
import { City, User } from '@/types';
import { POSITION_VALUES, SKILL_LEVEL_VALUES, SKILL_LEVELS } from '@/constants/game';
import { CityPicker } from '@/components/ui/CityPicker';
import { useLocationStore } from '@/store/locationStore';

const schema = z.object({
  name: z.string().min(2, 'At least 2 characters'),
  city: z.string().nullable().optional(),
  position: z.enum(POSITION_VALUES).nullable().optional(),
  skill_level: z.enum(SKILL_LEVEL_VALUES),
});

type FormData = z.infer<typeof schema>;

export default function EditProfileScreen() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user)!;
  const setUser = useAuthStore((s) => s.setUser);
  const { setActiveCity, cities } = useLocationStore();

  const [pendingAvatarUri, setPendingAvatarUri] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name ?? '',
      city: user.city ?? '',
      position: user.position ?? null,
      skill_level: user.skill_level ?? 'beginner',
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      let updatedUser: User;
      if (pendingAvatarUri) {
        await uploadAvatar(pendingAvatarUri);
      }
      updatedUser = await updateMe(data);
      return updatedUser;
    },
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      if (updatedUser.city) {
        const city = cities.find((c) => c.name === updatedUser.city);
        if (city) setActiveCity(city);
      }
      router.back();
    },
    onError: () => {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    },
  });

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPendingAvatarUri(result.assets[0].uri);
    }
  };

  const avatarSource = pendingAvatarUri ?? user.avatar_url;

  return (
    <View className="flex-1 bg-dark" style={{ paddingTop: top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color="#F0EDE8" />
        </Pressable>
        <Text className="font-display text-xl text-cream">EDIT PROFILE</Text>
        <Pressable
          onPress={handleSubmit((data) => saveMutation.mutate(data))}
          hitSlop={12}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            <ActivityIndicator size="small" color="#FF5C00" />
          ) : (
            <Text className="font-sans font-semibold text-sm" style={{ color: '#FF5C00' }}>
              Save
            </Text>
          )}
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View className="items-center pt-4 pb-8">
          <Pressable onPress={pickPhoto} className="items-center">
            <View
              className="rounded-full items-center justify-center mb-3"
              style={{
                width: 88,
                height: 88,
                backgroundColor: '#FF5C00',
                borderWidth: 2,
                borderColor: 'rgba(255,255,255,0.12)',
              }}
            >
              {avatarSource ? (
                <Image
                  source={{ uri: avatarSource }}
                  style={{ width: 88, height: 88, borderRadius: 44 }}
                />
              ) : (
                <Text style={{ color: '#fff', fontFamily: 'DMSans_600SemiBold', fontSize: 32 }}>
                  {initials(user.name)}
                </Text>
              )}
              <View
                className="absolute bottom-0 right-0 rounded-full items-center justify-center"
                style={{
                  width: 26,
                  height: 26,
                  backgroundColor: '#FF5C00',
                  borderWidth: 2,
                  borderColor: '#0A0A0A',
                }}
              >
                <Ionicons name="camera" size={13} color="#fff" />
              </View>
            </View>
            <Text className="font-sans text-sm" style={{ color: '#FF5C00' }}>
              Change photo
            </Text>
          </Pressable>
        </View>

        {/* Form fields */}
        <View style={{ gap: 20 }}>
          <Controller
            control={control}
            name="name"
            render={({ field: { value, onChange, onBlur } }) => (
              <FormInput
                label="Full name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Your name"
                autoCapitalize="words"
                error={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="city"
            render={({ field: { value, onChange } }) => (
              <CityPicker
                variant="row"
                value={value ?? ''}
                onChange={(city: City) => onChange(city.name)}
              />
            )}
          />

          {/* Position pills */}
          <Controller
            control={control}
            name="position"
            render={({ field: { value, onChange } }) => (
              <View>
                <Text className="text-cream font-sans text-sm mb-3">Position</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {POSITION_VALUES.map((pos) => {
                    const active = value === pos;
                    return (
                      <Pressable
                        key={pos}
                        onPress={() => onChange(active ? null : pos)}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 9,
                          borderRadius: 100,
                          backgroundColor: active ? '#FF5C00' : '#181818',
                          borderWidth: 1,
                          borderColor: active ? '#FF5C00' : 'rgba(255,255,255,0.08)',
                        }}
                      >
                        <Text
                          className="font-sans"
                          style={{ fontSize: 14, color: active ? '#F0EDE8' : '#7A7870' }}
                        >
                          {pos}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
          />

          {/* Skill level pills */}
          <Controller
            control={control}
            name="skill_level"
            render={({ field: { value, onChange } }) => (
              <View>
                <Text className="text-cream font-sans text-sm mb-3">Skill level</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {SKILL_LEVELS.map(({ key, label }) => {
                    const active = value === key;
                    return (
                      <Pressable
                        key={key}
                        onPress={() => onChange(key)}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 9,
                          borderRadius: 100,
                          backgroundColor: active ? '#FF5C00' : '#181818',
                          borderWidth: 1,
                          borderColor: active ? '#FF5C00' : 'rgba(255,255,255,0.08)',
                        }}
                      >
                        <Text
                          className="font-sans"
                          style={{ fontSize: 14, color: active ? '#F0EDE8' : '#7A7870' }}
                        >
                          {label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                {errors.skill_level && (
                  <Text className="text-danger text-sm mt-1 font-sans">
                    {errors.skill_level.message}
                  </Text>
                )}
              </View>
            )}
          />
        </View>
      </ScrollView>
    </View>
  );
}
