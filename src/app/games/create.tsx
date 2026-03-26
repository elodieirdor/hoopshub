import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GameForm, GameFormData, gameFormSchema } from '@/components/games/GameForm';
import { getCourts } from '@/api/courts';
import { createGame } from '@/api/games';
import { Court } from '@/types';
import { useLocationStore } from '@/store/locationStore';

export default function CreateGameScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { court_id: courtIdParam } = useLocalSearchParams<{ court_id?: string }>();
  const { activeCity } = useLocationStore();

  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const { data: courts = [], isLoading: courtsLoading } = useQuery({
    queryKey: ['courts', activeCity?.id],
    queryFn: () =>
      getCourts({
        lat: activeCity?.lat,
        lng: activeCity?.lng,
        radius_km: activeCity?.radius_km ?? 30,
      }),
    enabled: !!activeCity,
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GameFormData>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: {
      duration_mins: 90,
      max_players: 10,
      skill_level: 'any',
      game_type: 'casual',
      starts_at: (() => {
        const d = new Date();
        d.setMinutes(0, 0, 0);
        d.setHours(d.getHours() + 1);
        return d;
      })(),
    },
  });

  useEffect(() => {
    if (courtIdParam && courts.length > 0) {
      const prefilled = courts.find((c) => c.id === Number(courtIdParam));
      if (prefilled) {
        setSelectedCourt(prefilled);
        setValue('court_id', prefilled.id);
      }
    }
  }, [courtIdParam, courts, setValue]);

  const createMutation = useMutation({
    mutationFn: createGame,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      router.replace('/(tabs)/games');
    },
    onError: () => setApiError('Failed to post game. Please try again.'),
  });

  const onSubmit = async (data: GameFormData) => {
    setApiError(null);
    try {
      await createMutation.mutateAsync({
        court_id: data.court_id,
        title: data.title,
        description: data.description,
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

  return (
    <GameForm
      heading="POST A GAME"
      onClose={() => router.back()}
      control={control}
      errors={errors}
      handleSubmit={handleSubmit}
      setValue={setValue}
      watch={watch}
      onSubmit={onSubmit}
      submitLabel="Post game"
      submittingLabel="Posting…"
      isSubmitting={isSubmitting}
      apiError={apiError}
      courts={courts}
      courtsLoading={courtsLoading}
      selectedCourt={selectedCourt}
      onSelectCourt={setSelectedCourt}
    />
  );
}
