import React from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { FormInput } from '@/components/ui/form-input';
import { updatePassword } from '@/api/users';

const schema = z
  .object({
    current_password: z.string().min(1, 'Enter your current password'),
    password: z.string().min(8, 'At least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });

type FormData = z.infer<typeof schema>;

export default function ChangePasswordScreen() {
  const { bottom } = useSafeAreaInsets();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (data: FormData) => updatePassword(data),
    onSuccess: () => {
      Alert.alert('Password updated', 'Your password has been changed.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: () => {
      Alert.alert('Error', 'Could not update password. Check your current password and try again.');
    },
  });

  return (
    <View className="flex-1 bg-dark">
      <Stack.Screen options={{ title: 'CHANGE PASSWORD' }} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: 16 }}>
          <Controller
            control={control}
            name="current_password"
            render={({ field: { value, onChange, onBlur } }) => (
              <FormInput
                label="Current password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="••••••••"
                secureTextEntry
                error={errors.current_password?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange, onBlur } }) => (
              <FormInput
                label="New password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="••••••••"
                secureTextEntry
                error={errors.password?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="password_confirmation"
            render={({ field: { value, onChange, onBlur } }) => (
              <FormInput
                label="Confirm new password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="••••••••"
                secureTextEntry
                error={errors.password_confirmation?.message}
              />
            )}
          />
        </View>
      </ScrollView>

      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: bottom + 12,
          borderTopWidth: 0.5,
          borderColor: 'rgba(255,255,255,0.08)',
          backgroundColor: '#0A0A0A',
        }}
      >
        <Pressable
          onPress={handleSubmit((data) => mutation.mutate(data))}
          disabled={mutation.isPending}
          style={{
            backgroundColor: mutation.isPending ? '#7A7870' : '#FF5C00',
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: 'center',
          }}
        >
          {mutation.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontFamily: 'DMSans_600SemiBold', fontSize: 16 }}>
              Save
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
