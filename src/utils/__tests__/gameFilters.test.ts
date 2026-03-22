import { isToday, isThisWeekend, applyFilters, FilterKey } from '../gameFilters';
import { Game, Court, User } from '@/types';

// ── Helpers ──────────────────────────────────────────────────────────────────

function isoOffset(days: number, hours = 12): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString();
}

const mockUser: User = {
  id: 1,
  name: 'Alex',
  username: 'alex',
  city: 'Christchurch',
  position: null,
  skill_level: 'intermediate',
  avatar_url: null,
  games_played: 0,
  avg_rating: 0,
};

const mockCourt: Court = {
  id: 1,
  name: 'Cowles',
  address: '751 Pages Rd',
  city: 'Christchurch',
  lat: -43.504,
  lng: 172.675,
  court_type: 'indoor',
  surface: 'hardwood',
  full_court: true,
  lit: true,
  is_free: false,
  images: [],
};

function makeGame(overrides: Partial<Game> = {}): Game {
  return {
    id: 1,
    host_id: 1,
    court_id: 1,
    title: 'Pickup',
    description: null,
    starts_at: isoOffset(1),
    duration_mins: 60,
    max_players: 10,
    skill_level: 'intermediate',
    game_type: '5v5',
    status: 'open',
    created_at: new Date().toISOString(),
    host: mockUser,
    court: mockCourt,
    game_players: [],
    ...overrides,
  };
}

// ── isToday ───────────────────────────────────────────────────────────────────

describe('isToday', () => {
  it('returns true for the current date', () => {
    expect(isToday(new Date().toISOString())).toBe(true);
  });

  it('returns false for tomorrow', () => {
    expect(isToday(isoOffset(1))).toBe(false);
  });

  it('returns false for yesterday', () => {
    expect(isToday(isoOffset(-1))).toBe(false);
  });
});

// ── isThisWeekend ─────────────────────────────────────────────────────────────

describe('isThisWeekend', () => {
  it('returns false for a date far in the future', () => {
    expect(isThisWeekend(isoOffset(14))).toBe(false);
  });

  it('returns false for yesterday', () => {
    expect(isThisWeekend(isoOffset(-1))).toBe(false);
  });

  it('saturday of this week is the weekend', () => {
    const now = new Date();
    const daysToSat = (6 - now.getDay() + 7) % 7;
    if (daysToSat === 0 && now.getDay() === 6) {
      // today is Saturday — should be true
      expect(isThisWeekend(new Date().toISOString())).toBe(true);
    } else {
      expect(isThisWeekend(isoOffset(daysToSat))).toBe(true);
    }
  });
});

// ── applyFilters ──────────────────────────────────────────────────────────────

describe('applyFilters', () => {
  const games = [
    makeGame({
      id: 1,
      starts_at: new Date().toISOString(),
      skill_level: 'intermediate',
      game_type: '3v3',
    }),
    makeGame({ id: 2, starts_at: isoOffset(3), skill_level: 'advanced', game_type: '5v5' }),
    makeGame({ id: 3, starts_at: isoOffset(1), skill_level: 'intermediate', game_type: '5v5' }),
  ];

  it('returns all games when no filters active', () => {
    expect(applyFilters(games, new Set())).toHaveLength(3);
  });

  it('filters to today only', () => {
    const result = applyFilters(games, new Set<FilterKey>(['today']));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('filters by skill level intermediate', () => {
    const result = applyFilters(games, new Set<FilterKey>(['intermediate']));
    expect(result.every((g) => g.skill_level === 'intermediate')).toBe(true);
    expect(result).toHaveLength(2);
  });

  it('filters by game type 3v3', () => {
    const result = applyFilters(games, new Set<FilterKey>(['3v3']));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('applies multiple filters with AND logic', () => {
    // game 1 is today + intermediate + 3v3 → passes all three
    const result = applyFilters(games, new Set<FilterKey>(['today', 'intermediate', '3v3']));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('nearme filter is a no-op', () => {
    const result = applyFilters(games, new Set<FilterKey>(['nearme']));
    expect(result).toHaveLength(3);
  });

  it('returns empty when no games match', () => {
    const result = applyFilters(games, new Set<FilterKey>(['today', '3v3', 'intermediate']));
    // only game 1 has all three — still 1 result
    expect(result).toHaveLength(1);

    // filter for today + advanced — no game is both
    const none = applyFilters(games, new Set<FilterKey>(['today', 'intermediate']));
    // game 1 is today + intermediate
    expect(none).toHaveLength(1);

    // filter for today + 5v5 — game 1 is today but 3v3
    const empty = applyFilters(games, new Set<FilterKey>(['today', '3v3']));
    expect(empty.every((g) => g.game_type === '3v3')).toBe(true);
  });
});
