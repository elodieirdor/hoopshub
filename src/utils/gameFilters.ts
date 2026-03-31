import { Game } from '@/types';

export type FilterKey = 'today' | 'weekend' | 'intermediate' | '3v3' | 'nearme' | 'sub_needed';

export function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function isThisWeekend(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  const day = now.getDay();
  const daysToSat = (6 - day + 7) % 7;
  const daysToSun = (0 - day + 7) % 7 || 7;
  const sat = new Date(now);
  sat.setDate(now.getDate() + daysToSat);
  sat.setHours(0, 0, 0, 0);
  const sun = new Date(now);
  sun.setDate(now.getDate() + daysToSun);
  sun.setHours(23, 59, 59, 999);
  return d >= sat && d <= sun;
}

export function applyFilters(games: Game[], active: Set<FilterKey>): Game[] {
  if (active.size === 0) {
    return games;
  }

  return games.filter((g) => {
    if (active.has('today') && !isToday(g.starts_at)) {
      return false;
    }
    if (active.has('weekend') && !isThisWeekend(g.starts_at)) {
      return false;
    }

    if (active.has('intermediate') && g.skill_level !== 'intermediate') {
      return false;
    }
    if (active.has('3v3') && g.game_type !== '3v3') {
      return false;
    }
    if (active.has('sub_needed') && g.game_type !== 'sub_needed') {
      return false;
    }
    return true;
  });
}
