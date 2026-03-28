import React from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { router, Stack } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { FormInput } from '@/components/ui/form-input';
import { updateEmail } from '@/api/users';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  current_password: z.string().min(1, 'Enter your current password'),
});

type FormData = z.infer<typeof schema>;

export default function ChangeEmailScreen() {
  const setUser = useAuthStore((s) => s.setUser);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (data: FormData) => updateEmail(data),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      router.back();
    },
    onError: () => {
      Alert.alert('Error', 'Could not update email. Check your password and try again.');
    },
  });

  return (
    <View className="flex-1 bg-dark">
      <Stack.Screen
        options={{
          title: 'CHANGE EMAIL',
          headerRight: () =>
            mutation.isPending ? (
              <ActivityIndicator size="small" color="#FF5C00" />
            ) : (
              <Pressable
                onPress={handleSubmit((data) => mutation.mutate(data))}
                hitSlop={12}
                disabled={mutation.isPending}
              >
                <Text style={{ color: '#FF5C00', fontFamily: 'DMSans_600SemiBold', fontSize: 14 }}>
                  Save
                </Text>
              </Pressable>
            ),
        }}
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: 16 }}>
          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange, onBlur } }) => (
              <FormInput
                label="New email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={errors.email?.message}
              />
            )}
          />
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
        </View>
      </ScrollView>
    </View>
  );
}
