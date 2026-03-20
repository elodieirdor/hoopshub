import React, { useState } from 'react';
import { TextInput as RNTextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TextInput, Pressable } from '@/tw';

type Props = Omit<React.ComponentProps<typeof RNTextInput>, 'style'> & {
  label?: string;
  error?: string;
};

export function FormInput({ label, error, secureTextEntry, ...props }: Props) {
  const [hidden, setHidden] = useState(true);

  return (
    <View>
      {label && <Text className="text-cream font-sans text-sm mb-2">{label}</Text>}
      <View className="bg-surface rounded-xl flex-row items-center px-4">
        <TextInput
          className="flex-1 text-cream py-4 font-sans text-base"
          placeholderTextColor="#7A7870"
          underlineColorAndroid="transparent"
          secureTextEntry={secureTextEntry ? hidden : false}
          {...props}
        />
        {secureTextEntry && (
          <Pressable onPress={() => setHidden((h) => !h)} className="pl-2">
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color="#7A7870" />
          </Pressable>
        )}
      </View>
      {error && <Text className="text-danger text-sm mt-1 font-sans">{error}</Text>}
    </View>
  );
}
