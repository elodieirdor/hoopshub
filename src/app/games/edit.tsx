import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GameForm, GameFormData, gameFormSchema } from '@/components/games/GameForm';
import { getCourts } from '@/api/courts';
import { getGame, updateGame } from '@/api/games';
import { Court } from '@/types';

export default function EditGameScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const { data: game, isLoading: gameLoading } = useQuery({
    queryKey: ['game', id],
    queryFn: () => getGame(Number(id)),
    enabled: !!id,
  });

  const { data: courts = [], isLoading: courtsLoading } = useQuery({
    queryKey: ['courts', { city: 'Christchurch' }],
    queryFn: () => getCourts({ city: 'Christchurch' }),
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GameFormData>({
    resolver: zodResolver(gameFormSchema),
  });

  const initialized = useRef(false);
  useEffect(() => {
    if (!game || courts.length === 0 || initialized.current) return;
    initialized.current = true;
    const court = courts.find((c) => c.id === game.court_id) ?? game.court ?? null;
    setSelectedCourt(court);
    reset({
      court_id: game.court_id,
      title: game.title,
      description: game.description ?? undefined,
      starts_at: new Date(game.starts_at),
      duration_mins: game.duration_mins,
      max_players: game.max_players,
      skill_level: game.skill_level,
      game_type: game.game_type,
    });
  }, [game, courts, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<typeof game>) => updateGame(Number(id), data!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game', id] });
      router.back();
    },
    onError: () => setApiError('Failed to save changes. Please try again.'),
  });

  const onSubmit = async (data: GameFormData) => {
    setApiError(null);
    try {
      await updateMutation.mutateAsync({
        court_id: data.court_id,
        title: data.title,
        description: data.description ?? null,
        starts_at: data.starts_at.toISOString(),
        duration_mins: data.duration_mins,
        max_players: data.max_players,
        skill_level: data.skill_level,
        game_type: data.game_type,
      });
    } catch {
      // handled by onError
    }
  };

  if (gameLoading) {
    return (
      <View className="flex-1 bg-dark justify-center items-center">
        <ActivityIndicator color="#FF5C00" />
      </View>
    );
  }

  return (
    <GameForm
      heading="EDIT GAME"
      onClose={() => router.back()}
      control={control}
      errors={errors}
      handleSubmit={handleSubmit}
      setValue={setValue}
      watch={watch}
      onSubmit={onSubmit}
      submitLabel="Save changes"
      submittingLabel="Saving…"
      isSubmitting={isSubmitting}
      apiError={apiError}
      courts={courts}
      courtsLoading={courtsLoading}
      selectedCourt={selectedCourt}
      onSelectCourt={setSelectedCourt}
    />
  );
}
