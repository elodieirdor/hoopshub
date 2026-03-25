import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, View, Text, Pressable, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import { FormInput } from '@/components/ui/form-input';
import { useAuthStore } from '@/store/authStore';
import { useLocationStore } from '@/store/locationStore';
import { CityPicker } from '@/components/ui/CityPicker';
import { SKILL_LEVELS, SKILL_LEVEL_VALUES } from '@/constants/game';

const schema = z.object({
  name: z.string().min(2, 'Enter your full name'),
  email: z.email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  skill_level: z.enum(SKILL_LEVEL_VALUES),
  city: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function RegisterScreen() {
  const [error, setError] = useState<string | null>(null);
  const { activeCity } = useLocationStore();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      await useAuthStore.getState().register(data);
    } catch {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1 bg-dark"
        contentContainerClassName="flex-grow justify-center px-6 py-12"
      >
        {/* Back button */}
        <Pressable className="flex-row items-center mb-8" onPress={() => router.back()}>
          <Text className="text-cream font-sans text-base">← Back</Text>
        </Pressable>

        {/* Heading */}
        <Text className="font-display text-3xl text-cream mb-8">Create account</Text>

        {/* Full name */}
        <View className="mb-4">
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                placeholder="Name"
                autoCorrect={false}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.name?.message}
              />
            )}
          />
        </View>

        {/* Email */}
        <View className="mb-4">
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.email?.message}
              />
            )}
          />
        </View>

        {/* Password */}
        <View className="mb-4">
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                placeholder="Password"
                secureTextEntry
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.password?.message}
              />
            )}
          />
        </View>

        {/* Skill level */}
        <View className="mb-6">
          <Text className="text-cream font-sans text-sm mb-3">Skill level</Text>
          <Controller
            control={control}
            name="skill_level"
            render={({ field: { onChange, value } }) => (
              <View className="flex-row gap-2 flex-wrap">
                {SKILL_LEVELS.map(({ key, label }) => {
                  const active = value === key;
                  return (
                    <Pressable
                      key={key}
                      onPress={() => onChange(key)}
                      className={
                        active
                          ? 'bg-orange rounded-full px-4 py-2'
                          : 'bg-surface border border-border rounded-full px-4 py-2'
                      }
                    >
                      <Text
                        className={
                          active ? 'text-cream font-sans text-sm' : 'text-muted font-sans text-sm'
                        }
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          />
          {errors.skill_level && (
            <Text className="text-danger text-sm mt-1 font-sans">{errors.skill_level.message}</Text>
          )}
        </View>

        {/* City (optional) */}
        <View className="mb-6">
          <Controller
            control={control}
            name="city"
            defaultValue={activeCity?.name}
            render={({ field: { onChange, value } }) => (
              <CityPicker value={value} onChange={(city) => onChange(city.name)} />
            )}
          />
        </View>

        {/* API error */}
        {error && <Text className="text-danger text-sm mb-4 font-sans text-center">{error}</Text>}

        {/* Submit */}
        <Pressable
          className="bg-orange rounded-xl py-4 items-center"
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <Text className="text-cream font-sans text-base font-semibold">
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
