import { initials, formatDuration, SKILL_COLORS } from '../formatters';

describe('initials', () => {
  it('returns two uppercase initials for a full name', () => {
    expect(initials('John Smith')).toBe('JS');
  });

  it('returns one initial for a single name', () => {
    expect(initials('Alex')).toBe('A');
  });

  it('lowercased input is uppercased', () => {
    expect(initials('luke skywalker')).toBe('LS');
  });

  it('takes only the first two words', () => {
    expect(initials('John Paul Jones')).toBe('JP');
  });
});

describe('formatDuration', () => {
  it('formats minutes under an hour', () => {
    expect(formatDuration(45)).toBe('45 min');
  });

  it('formats exactly 60 minutes as 1h', () => {
    expect(formatDuration(60)).toBe('1h');
  });

  it('formats 90 minutes as 1h 30m', () => {
    expect(formatDuration(90)).toBe('1h 30m');
  });

  it('formats 120 minutes as 2h', () => {
    expect(formatDuration(120)).toBe('2h');
  });

  it('formats 150 minutes as 2h 30m', () => {
    expect(formatDuration(150)).toBe('2h 30m');
  });
});

describe('SKILL_COLORS', () => {
  it('has a hex color for every skill level', () => {
    const levels = ['beginner', 'intermediate', 'advanced', 'comp', 'any'] as const;
    for (const level of levels) {
      expect(SKILL_COLORS[level]).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});
