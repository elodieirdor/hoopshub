import React from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { FormInput } from '@/components/ui/form-input';
import { updateEmail } from '@/api/users';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  current_password: z.string().min(1, 'Enter your current password'),
});

type FormData = z.infer<typeof schema>;

export default function ChangeEmailScreen() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
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
    <View className="flex-1 bg-dark" style={{ paddingTop: top }}>
      <View className="flex-row items-center justify-between px-4 py-4">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color="#F0EDE8" />
        </Pressable>
        <Text className="font-display text-xl text-cream">CHANGE EMAIL</Text>
        <Pressable
          onPress={handleSubmit((data) => mutation.mutate(data))}
          hitSlop={12}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
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
