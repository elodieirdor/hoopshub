import React from 'react';
import { Link as RouterLink } from 'expo-router';
import Animated from 'react-native-reanimated';
import {
  View as RNView,
  Text as RNText,
  Pressable as RNPressable,
  ScrollView as RNScrollView,
  TouchableHighlight as RNTouchableHighlight,
  TextInput as RNTextInput,
} from 'react-native';

// Univind handles className → style at build time via the Metro transformer.
// These wrappers exist solely to add className / contentContainerClassName
// to the TypeScript types; no runtime CSS processing is needed.

export const View = (props: React.ComponentProps<typeof RNView> & { className?: string }) => (
  <RNView {...(props as any)} />
);
View.displayName = 'View';

export const Text = (props: React.ComponentProps<typeof RNText> & { className?: string }) => (
  <RNText {...(props as any)} />
);
Text.displayName = 'Text';

export const TextInput = (
  props: React.ComponentProps<typeof RNTextInput> & { className?: string },
) => <RNTextInput {...(props as any)} />;
TextInput.displayName = 'TextInput';

export const Pressable = (
  props: React.ComponentProps<typeof RNPressable> & { className?: string },
) => <RNPressable {...(props as any)} />;
Pressable.displayName = 'Pressable';

export const ScrollView = (
  props: React.ComponentProps<typeof RNScrollView> & {
    className?: string;
    contentContainerClassName?: string;
  },
) => <RNScrollView {...(props as any)} />;
ScrollView.displayName = 'ScrollView';

export const TouchableHighlight = (
  props: React.ComponentProps<typeof RNTouchableHighlight> & {
    className?: string;
  },
) => <RNTouchableHighlight {...(props as any)} />;
TouchableHighlight.displayName = 'TouchableHighlight';

export const Link = (props: React.ComponentProps<typeof RouterLink> & { className?: string }) => (
  <RouterLink {...(props as any)} />
);

export const AnimatedScrollView = (
  props: React.ComponentProps<typeof Animated.ScrollView> & {
    className?: string;
    contentContainerClassName?: string;
  },
) => <Animated.ScrollView {...(props as any)} />;
