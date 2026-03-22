export interface User {
  id: number;
  name: string;
  username: string;
  city: string | null;
  position: 'Guard' | 'Forward' | 'Centre' | 'Any' | null;
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'comp';
  avatar_url: string | null;
  games_played: number;
  avg_rating: number;
}

export type CurrentUser = User & {
  email: string;
};

export interface Court {
  id: number;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  surface: 'hardwood' | 'concrete' | 'asphalt' | null;
  court_type: 'indoor' | 'outdoor';
  full_court: boolean | null;
  lit: boolean;
  is_free: boolean;
  images: string[] | undefined;
}

export interface Game {
  id: number;
  host_id: number;
  court_id: number;
  title: string;
  description: string | null;
  starts_at: string;
  duration_mins: number;
  max_players: number;
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'comp' | 'any';
  game_type: '3v3' | '5v5' | 'casual';
  status: 'open' | 'full' | 'cancelled' | 'completed';
  created_at: string;
  host: User;
  court: Court;
  game_players: GamePlayer[];
  players?: User[];
}

export interface GamePlayer {
  id: number;
  game_id: number;
  player_id: number;
  joined_at: string;
  player: User;
}

export interface Rating {
  id: number;
  game_id: number;
  rater_id: number;
  rated_id: number;
  punctuality: number;
  sportsmanship: number;
  skill_accuracy: number;
  fun_to_play: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
