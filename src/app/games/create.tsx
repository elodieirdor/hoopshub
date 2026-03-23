import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GameForm, GameFormData, gameFormSchema } from '@/components/games/GameForm';
import { getCourts } from '@/api/courts';
import { createGame } from '@/api/games';
import { Court } from '@/types';

export default function CreateGameScreen() {
  const router = useRouter();
  const { court_id: courtIdParam } = useLocalSearchParams<{ court_id?: string }>();

  const [courts, setCourts] = useState<Court[]>([]);
  const [courtsLoading, setCourtsLoading] = useState(true);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

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
    (async () => {
      try {
        const data = await getCourts({ city: 'Christchurch' });
        setCourts(data);
        if (courtIdParam) {
          const prefilled = data.find((c) => c.id === Number(courtIdParam));
          if (prefilled) {
            setSelectedCourt(prefilled);
            setValue('court_id', prefilled.id);
          }
        }
      } catch {
        // silently fail — courts list is still usable via the modal
      } finally {
        setCourtsLoading(false);
      }
    })();
  }, [courtIdParam, setValue]);

  const onSubmit = async (data: GameFormData) => {
    setApiError(null);
    try {
      await createGame({
        court_id: data.court_id,
        title: data.title,
        description: data.description,
        starts_at: data.starts_at.toISOString(),
        duration_mins: data.duration_mins,
        max_players: data.max_players,
        skill_level: data.skill_level,
        game_type: data.game_type,
      });
      router.replace('/(tabs)/games');
    } catch {
      setApiError('Failed to post game. Please try again.');
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
