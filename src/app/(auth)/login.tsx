import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, View, Text, Pressable, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import { FormInput } from '@/components/ui/form-input';
import { useAuthStore } from '@/store/authStore';
import { storage } from '@/utils/storage';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ email, password }: FormData) => {
    setError(null);
    try {
      await useAuthStore.getState().login(email, password);
      const shown = await storage.get('notification_prompt_shown');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.replace((shown === 'true' ? '/(tabs)' : '/notifications-opt-in') as any);
    } catch {
      setError('Invalid email or password');
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
        {/* Logo */}
        <View className="items-center mb-3">
          <Text className="font-display text-[40px] text-cream tracking-wide">
            HOOPS<Text className="text-orange">HUB</Text>
          </Text>
        </View>

        {/* Tagline */}
        <View className="items-center mb-10">
          <Text className="font-sans text-muted text-base">Find your run.</Text>
        </View>

        {/* Email input */}
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

        {/* Password input */}
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

        {/* API error */}
        {error && <Text className="text-danger text-sm mb-4 font-sans text-center">{error}</Text>}

        {/* Submit button */}
        <Pressable
          className="bg-orange rounded-xl py-4 items-center mb-6"
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <Text className="text-cream font-sans text-base font-semibold">
            {isSubmitting ? 'Logging in…' : 'Login'}
          </Text>
        </Pressable>

        {/* Register link */}
        <Pressable onPress={() => router.push('/(auth)/register')}>
          <Text className="text-muted font-sans text-sm text-center">
            Don&apos;t have an account? <Text className="text-orange">Register</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
