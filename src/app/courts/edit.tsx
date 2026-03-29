import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heading } from '@/components/ui/Heading';
import * as Burnt from 'burnt';
import { useLocalSearchParams, router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { updateCourt } from '@/api/courts';
import { courtQueries } from '@/api/queries';
import { SegmentedControl } from '@/components/forms/SegmentedControl';
import { Toggle } from '@/components/forms/Toggle';

const schema = z.object({
  court_type: z.enum(['indoor', 'outdoor']),
  surface: z.enum(['hardwood', 'concrete', 'asphalt']).nullable(),
  full_court: z.boolean().nullable(),
  lit: z.boolean(),
  is_free: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export default function EditCourtScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bottom } = useSafeAreaInsets();

  const [error, setError] = useState<string | null>(null);

  const { data: court, isLoading: initialLoading } = useQuery(courtQueries.detail(id!));

  const { control, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      court_type: 'outdoor',
      surface: null,
      full_court: null,
      lit: false,
      is_free: true,
    },
  });

  const initialized = useRef(false);
  useEffect(() => {
    if (!court || initialized.current) return;
    initialized.current = true;
    reset({
      court_type: court.court_type,
      surface: court.surface,
      full_court: court.full_court,
      lit: court.lit,
      is_free: court.is_free,
    });
  }, [court, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => updateCourt(Number(id), data),
    onSuccess: () => {
      Burnt.alert({
        title: 'Thanks for your update 🙌',
        message: "We'll review it and get it live soon.",
        preset: 'done',
      });
      router.back();
    },
    onError: () => setError('Failed to save changes'),
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      await updateMutation.mutateAsync(data);
    } catch {
      // handled by onError
    }
  };

  if (initialLoading) {
    return (
      <View className="flex-1 bg-dark justify-center items-center">
        <ActivityIndicator color="#FF5C00" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-dark">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <View
          className="mb-6 pb-5"
          style={{ borderBottomWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <Heading level={2}>{court?.name}</Heading>
          <Text className="text-muted font-sans text-sm mt-1">{court?.address}</Text>
        </View>

        <Controller
          control={control}
          name="court_type"
          render={({ field: { value, onChange } }) => (
            <SegmentedControl
              label="Court type"
              options={[
                { label: 'Outdoor', value: 'outdoor' },
                { label: 'Indoor', value: 'indoor' },
              ]}
              value={value}
              onChange={onChange}
            />
          )}
        />

        <Controller
          control={control}
          name="surface"
          render={({ field: { value, onChange } }) => (
            <SegmentedControl
              label="Surface"
              options={[
                { label: 'Hardwood', value: 'hardwood' },
                { label: 'Concrete', value: 'concrete' },
                { label: 'Asphalt', value: 'asphalt' },
              ]}
              value={value}
              onChange={onChange}
            />
          )}
        />

        <Controller
          control={control}
          name="full_court"
          render={({ field: { value, onChange } }) => (
            <SegmentedControl
              label="Size"
              options={[
                { label: 'Full court', value: 'true' as any },
                { label: 'Half court', value: 'false' as any },
              ]}
              value={value === null ? null : ((value ? 'true' : 'false') as any)}
              onChange={(v) => onChange(v === 'true')}
            />
          )}
        />

        <View className="mb-6">
          <Controller
            control={control}
            name="lit"
            render={({ field: { value, onChange } }) => (
              <Toggle label="Lit at night" value={value} onChange={onChange} />
            )}
          />
          <Controller
            control={control}
            name="is_free"
            render={({ field: { value, onChange } }) => (
              <Toggle label="Free to use" value={value} onChange={onChange} />
            )}
          />
        </View>

        {error && <Text className="text-danger font-sans text-sm mb-4">{error}</Text>}
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
          onPress={handleSubmit(onSubmit)}
          disabled={updateMutation.isPending}
          className="bg-orange rounded-xl py-4 items-center"
          style={{ opacity: updateMutation.isPending ? 0.6 : 1 }}
        >
          {updateMutation.isPending ? (
            <ActivityIndicator color="#F0EDE8" />
          ) : (
            <Text className="text-cream font-sans font-semibold text-base">Save changes</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
