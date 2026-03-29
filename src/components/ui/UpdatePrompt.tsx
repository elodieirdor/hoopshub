import { View, Text, Pressable, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heading } from './Heading';

interface StoreUpdateProps {
  variant: 'store';
  onUpdate: () => void;
}

interface OtaUpdateProps {
  variant: 'ota';
  onRestart: () => Promise<void>;
  onDismiss: () => void;
}

type Props = StoreUpdateProps | OtaUpdateProps;

export function UpdatePrompt(props: Props) {
  if (props.variant === 'store') {
    return <StoreUpdateModal onUpdate={props.onUpdate} />;
  }
  return <OtaBanner onRestart={props.onRestart} onDismiss={props.onDismiss} />;
}

function StoreUpdateModal({ onUpdate }: { onUpdate: () => void }) {
  return (
    <Modal visible animationType="fade" transparent={false} statusBarTranslucent>
      <View className="flex-1 bg-dark items-center justify-center px-8">
        <Ionicons name="basketball" size={64} color="#FF5C00" style={{ marginBottom: 24 }} />

        <Heading level={2} className="text-center mb-3">
          UPDATE REQUIRED
        </Heading>

        <Text className="text-muted font-sans text-[15px] text-center leading-[22px] mb-10">
          This version of HoopsHub is no longer supported. Download the latest version to keep
          playing.
        </Text>

        <Pressable
          onPress={onUpdate}
          className="bg-orange rounded-xl py-4 px-12 w-full items-center"
        >
          <Text className="text-cream font-sans font-semibold text-base">Update Now</Text>
        </Pressable>

        <Text className="text-muted font-sans text-xs mt-4 text-center">
          {Platform.OS === 'ios' ? 'Opens the App Store' : 'Opens the Play Store'}
        </Text>
      </View>
    </Modal>
  );
}

function OtaBanner({
  onRestart,
  onDismiss,
}: {
  onRestart: () => Promise<void>;
  onDismiss: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute left-4 right-4 bg-surface rounded-2xl border border-border p-4 flex-row items-center gap-3 z-[100]"
      style={{
        bottom: insets.bottom + 16,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      }}
    >
      <Ionicons name="arrow-up-circle" size={24} color="#FF5C00" />

      <View className="flex-1">
        <Text className="text-cream font-sans font-semibold text-sm">Update ready</Text>
        <Text className="text-muted font-sans text-xs">Restart to apply the latest changes.</Text>
      </View>

      <Pressable
        onPress={onRestart}
        className="rounded-lg py-2 px-3.5 border"
        style={{
          backgroundColor: 'rgba(255,92,0,0.15)',
          borderColor: 'rgba(255,92,0,0.3)',
        }}
      >
        <Text className="text-orange font-sans font-semibold text-[13px]">Restart</Text>
      </Pressable>

      <Pressable onPress={onDismiss} hitSlop={8} className="p-1">
        <Ionicons name="close" size={18} color="#7A7870" />
      </Pressable>
    </View>
  );
}
