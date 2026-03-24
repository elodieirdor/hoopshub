import { User, CurrentUser, Court, Game, GameInvitation } from '@/types';

export const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  name: 'Alex Johnson',
  city: 'Christchurch',
  position: 'Guard',
  skill_level: 'intermediate',
  avatar_url: null,
  games_played: 0,
  avg_rating: 0,
  hosted_count: 0,
  member_since: 'Jan 2026',
  ratings: { punctuality: 0, sportsmanship: 0, skill_accuracy: 0, fun_to_play: 0 },
  recent_games: [],
  ...overrides,
});

export const makeCurrentUser = (overrides: Partial<CurrentUser> = {}): CurrentUser => ({
  ...makeUser(),
  email: 'alex@example.com',
  ...overrides,
});

export const makeCourt = (overrides: Partial<Court> = {}): Court => ({
  id: 1,
  name: 'Cowles Stadium',
  address: '751 Pages Road, Christchurch',
  city: 'Christchurch',
  lat: -43.504,
  lng: 172.675,
  court_type: 'indoor',
  surface: 'hardwood',
  full_court: true,
  lit: true,
  is_free: false,
  images: [],
  ...overrides,
});

export const makeGame = (overrides: Partial<Game> = {}): Game => ({
  id: 1,
  host_id: 1,
  court_id: 1,
  title: 'Friday Pickup',
  description: null,
  starts_at: '2026-04-01T18:00:00Z',
  duration_mins: 90,
  max_players: 10,
  skill_level: 'intermediate',
  game_type: '5v5',
  status: 'open',
  created_at: '2026-01-01T00:00:00Z',
  host: makeUser(),
  court: makeCourt(),
  game_players: [],
  ...overrides,
});

export const makeInvitation = (overrides: Partial<GameInvitation> = {}): GameInvitation => ({
  id: 1,
  game_id: 1,
  inviter_id: 1,
  invitee_id: 2,
  status: 'pending',
  responded_at: null,
  created_at: '2026-01-01T00:00:00Z',
  game: makeGame(),
  inviter: makeUser(),
  ...overrides,
});
