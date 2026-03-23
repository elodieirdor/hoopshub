import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  message?: string;
  onRetry: () => void;
}

export function ErrorState({ message = 'Something went wrong', onRetry }: Props) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Ionicons
        name="alert-circle-outline"
        size={36}
        color="#7A7870"
        style={{ marginBottom: 12 }}
      />
      <Text className="text-muted font-sans text-center mb-4">{message}</Text>
      <Pressable
        onPress={onRetry}
        className="px-5 py-2 rounded-lg"
        style={{
          backgroundColor: 'rgba(255,92,0,0.15)',
          borderWidth: 1,
          borderColor: 'rgba(255,92,0,0.3)',
        }}
      >
        <Text className="text-orange font-sans font-semibold text-sm">Try again</Text>
      </Pressable>
    </View>
  );
}
