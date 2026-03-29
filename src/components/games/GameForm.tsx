import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Control,
  Controller,
  FieldErrors,
  UseFormHandleSubmit,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { z } from 'zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { FormInput } from '@/components/ui/form-input';
import { Court } from '@/types';

export const gameFormSchema = z.object({
  court_id: z.number({ error: 'Select a court' }),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  starts_at: z.date({ error: 'Select a date and time' }),
  duration_mins: z.number(),
  max_players: z.number(),
  skill_level: z.enum(['beginner', 'intermediate', 'advanced', 'comp', 'any']),
  game_type: z.enum(['3v3', '5v5', 'casual']),
});

export type GameFormData = z.infer<typeof gameFormSchema>;

const DURATIONS: { value: number; label: string }[] = [
  { value: 60, label: '60 min' },
  { value: 90, label: '90 min' },
  { value: 120, label: '2 hrs' },
  { value: 180, label: '3 hrs' },
];

const MAX_PLAYERS: { value: number; label: string }[] = [
  { value: 6, label: '6' },
  { value: 8, label: '8' },
  { value: 10, label: '10' },
  { value: 12, label: '12' },
];

const SKILL_LEVELS: { value: GameFormData['skill_level']; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'comp', label: 'Comp' },
  { value: 'any', label: 'Any' },
];

const GAME_TYPES: { value: GameFormData['game_type']; label: string }[] = [
  { value: '3v3', label: '3v3' },
  { value: '5v5', label: '5v5' },
  { value: 'casual', label: 'Casual' },
];

type PillProps<T> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
};

function PillSelector<T extends string | number>({ options, value, onChange }: PillProps<T>) {
  return (
    <View className="flex-row gap-2 flex-wrap">
      {options.map(({ value: v, label }) => {
        const active = value === v;
        return (
          <Pressable
            key={String(v)}
            onPress={() => onChange(v)}
            className={
              active
                ? 'bg-orange rounded-full px-4 py-2'
                : 'bg-surface border border-border rounded-full px-4 py-2'
            }
          >
            <Text
              className={active ? 'text-cream font-sans text-sm' : 'text-muted font-sans text-sm'}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

type Props = {
  control: Control<GameFormData>;
  errors: FieldErrors<GameFormData>;
  handleSubmit: UseFormHandleSubmit<GameFormData>;
  setValue: UseFormSetValue<GameFormData>;
  watch: UseFormWatch<GameFormData>;
  onSubmit: (data: GameFormData) => Promise<void>;
  submitLabel: string;
  submittingLabel: string;
  isSubmitting: boolean;
  apiError: string | null;
  courts: Court[];
  courtsLoading: boolean;
  selectedCourt: Court | null;
  onSelectCourt: (court: Court) => void;
};

export function GameForm({
  control,
  errors,
  handleSubmit,
  setValue,
  watch,
  onSubmit,
  submitLabel,
  submittingLabel,
  isSubmitting,
  apiError,
  courts,
  courtsLoading,
  selectedCourt,
  onSelectCourt,
}: Props) {
  const [courtModalVisible, setCourtModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const { bottom } = useSafeAreaInsets();

  const startsAt = watch('starts_at');

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1 bg-dark"
        contentContainerClassName="px-6 py-8"
        keyboardShouldPersistTaps="handled"
      >
        {/* Court selector */}
        <View className="mb-4">
          <Text className="text-cream font-sans text-sm mb-2">Court</Text>
          <Pressable
            onPress={() => setCourtModalVisible(true)}
            className="bg-surface rounded-xl px-4 py-4 flex-row items-center justify-between"
          >
            {courtsLoading ? (
              <ActivityIndicator size="small" color="#7A7870" />
            ) : (
              <>
                <Text
                  className={
                    selectedCourt
                      ? 'text-cream font-sans text-base'
                      : 'text-muted font-sans text-base'
                  }
                >
                  {selectedCourt ? selectedCourt.name : 'Select a court…'}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#7A7870" />
              </>
            )}
          </Pressable>
          {errors.court_id && (
            <Text className="text-danger text-sm mt-1 font-sans">{errors.court_id.message}</Text>
          )}
        </View>

        {/* Title */}
        <View className="mb-4">
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                label="Title"
                placeholder="e.g. Saturday Morning Run"
                autoCorrect={false}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.title?.message}
              />
            )}
          />
        </View>

        {/* Date & time */}
        <View className="mb-4">
          <Text className="text-cream font-sans text-sm mb-2">Date & time</Text>
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => setShowDatePicker(true)}
              className="flex-1 bg-surface rounded-xl px-4 py-4 flex-row items-center gap-2"
            >
              <Ionicons name="calendar-outline" size={16} color="#7A7870" />
              <Text className="text-cream font-sans text-sm">
                {startsAt
                  ? startsAt.toLocaleDateString('en-NZ', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Date'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setShowTimePicker(true)}
              className="flex-1 bg-surface rounded-xl px-4 py-4 flex-row items-center gap-2"
            >
              <Ionicons name="time-outline" size={16} color="#7A7870" />
              <Text className="text-cream font-sans text-sm">
                {startsAt
                  ? startsAt.toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit' })
                  : 'Time'}
              </Text>
            </Pressable>
          </View>
          {errors.starts_at && (
            <Text className="text-danger text-sm mt-1 font-sans">{errors.starts_at.message}</Text>
          )}
        </View>

        {showDatePicker && (
          <Controller
            control={control}
            name="starts_at"
            render={({ field: { onChange, value } }) => (
              <DateTimePicker
                mode="date"
                value={value ?? new Date()}
                minimumDate={new Date()}
                display="spinner"
                themeVariant="dark"
                onChange={(_, date) => {
                  setShowDatePicker(false);
                  if (date) {
                    const updated = new Date(value ?? new Date());
                    updated.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                    onChange(updated);
                  }
                }}
              />
            )}
          />
        )}

        {showTimePicker && (
          <Controller
            control={control}
            name="starts_at"
            render={({ field: { onChange, value } }) => (
              <DateTimePicker
                mode="time"
                value={value ?? new Date()}
                display="spinner"
                themeVariant="dark"
                minuteInterval={15}
                onChange={(_, date) => {
                  setShowTimePicker(false);
                  if (date) {
                    const updated = new Date(value ?? new Date());
                    updated.setHours(date.getHours(), date.getMinutes());
                    onChange(updated);
                  }
                }}
              />
            )}
          />
        )}

        {/* Duration */}
        <View className="mb-4">
          <Text className="text-cream font-sans text-sm mb-3">Duration</Text>
          <Controller
            control={control}
            name="duration_mins"
            render={({ field: { onChange, value } }) => (
              <PillSelector options={DURATIONS} value={value} onChange={onChange} />
            )}
          />
        </View>

        {/* Max players */}
        <View className="mb-4">
          <Text className="text-cream font-sans text-sm mb-3">Max players</Text>
          <Controller
            control={control}
            name="max_players"
            render={({ field: { onChange, value } }) => (
              <PillSelector options={MAX_PLAYERS} value={value} onChange={onChange} />
            )}
          />
        </View>

        {/* Skill level */}
        <View className="mb-4">
          <Text className="text-cream font-sans text-sm mb-3">Skill level</Text>
          <Controller
            control={control}
            name="skill_level"
            render={({ field: { onChange, value } }) => (
              <PillSelector options={SKILL_LEVELS} value={value} onChange={onChange} />
            )}
          />
          {errors.skill_level && (
            <Text className="text-danger text-sm mt-1 font-sans">{errors.skill_level.message}</Text>
          )}
        </View>

        {/* Game type */}
        <View className="mb-6">
          <Text className="text-cream font-sans text-sm mb-3">Game type</Text>
          <Controller
            control={control}
            name="game_type"
            render={({ field: { onChange, value } }) => (
              <PillSelector options={GAME_TYPES} value={value} onChange={onChange} />
            )}
          />
        </View>

        {/* Description */}
        <View className="mb-8">
          <Text className="text-cream font-sans text-sm mb-2">Description (optional)</Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="bg-surface rounded-xl px-4 py-3">
                <TextInput
                  className="text-cream font-sans text-base"
                  placeholder="Any extra details…"
                  placeholderTextColor="#7A7870"
                  multiline
                  numberOfLines={3}
                  autoCorrect={false}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  style={{ minHeight: 72, textAlignVertical: 'top' }}
                />
              </View>
            )}
          />
        </View>

        {/* API error */}
        {apiError && (
          <Text className="text-danger text-sm mb-4 font-sans text-center">{apiError}</Text>
        )}
      </ScrollView>

      <View
        style={{
          paddingHorizontal: 24,
          paddingTop: 12,
          paddingBottom: bottom + 12,
          borderTopWidth: 0.5,
          borderColor: 'rgba(255,255,255,0.08)',
          backgroundColor: '#0A0A0A',
        }}
      >
        <Pressable
          className="bg-orange rounded-xl py-4 items-center"
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <Text className="text-cream font-sans text-base font-semibold">
            {isSubmitting ? submittingLabel : submitLabel}
          </Text>
        </Pressable>
      </View>

      {/* Court picker modal */}
      <Modal
        visible={courtModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCourtModalVisible(false)}
      >
        <View className="flex-1 bg-dark pt-6">
          <View className="flex-row items-center justify-between px-6 mb-4">
            <Text className="font-display text-3xl text-cream">SELECT COURT</Text>
            <Pressable onPress={() => setCourtModalVisible(false)} hitSlop={12}>
              <Ionicons name="close" size={24} color="#F0EDE8" />
            </Pressable>
          </View>

          <FlatList
            data={courts}
            keyExtractor={(c) => c.id.toString()}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  onSelectCourt(item);
                  setValue('court_id', item.id, { shouldValidate: true });
                  setCourtModalVisible(false);
                }}
                className="py-4 border-b border-border flex-row items-center justify-between"
              >
                <View className="flex-1 mr-4">
                  <Text className="text-cream font-sans text-base font-semibold">{item.name}</Text>
                  <Text className="text-muted font-sans text-sm mt-0.5">{item.address}</Text>
                </View>
                {selectedCourt?.id === item.id && (
                  <Ionicons name="checkmark-circle" size={20} color="#FF5C00" />
                )}
              </Pressable>
            )}
            ListEmptyComponent={
              <Text className="text-muted font-sans text-center pt-8">No courts found.</Text>
            }
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
