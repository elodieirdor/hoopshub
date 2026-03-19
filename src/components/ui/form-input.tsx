import React from 'react';
import { TextInput as RNTextInput } from 'react-native';
import { View, Text, TextInput } from '@/tw';

type Props = Omit<React.ComponentProps<typeof RNTextInput>, 'style'> & {
  label?: string;
  error?: string;
};

export function FormInput({ label, error, ...props }: Props) {
  return (
    <View>
      {label && (
        <Text className="text-cream font-sans text-sm mb-2">{label}</Text>
      )}
      <TextInput
        className="bg-surface text-cream rounded-xl px-4 py-4 font-sans text-base"
        placeholderTextColor="#7A7870"
        underlineColorAndroid="transparent"
        {...props}
      />
      {error && (
        <Text className="text-danger text-sm mt-1 font-sans">{error}</Text>
      )}
    </View>
  );
}
