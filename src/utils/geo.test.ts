import { haversineKm, formatDistance } from './geo';

describe('haversineKm', () => {
  it('returns 0 for the same point', () => {
    expect(haversineKm(-43.5321, 172.6362, -43.5321, 172.6362)).toBe(0);
  });

  it('is symmetric', () => {
    const ab = haversineKm(-43.5321, 172.6362, -36.8485, 174.7633);
    const ba = haversineKm(-36.8485, 174.7633, -43.5321, 172.6362);
    expect(ab).toBeCloseTo(ba, 5);
  });

  it('returns ~764 km between Christchurch and Auckland', () => {
    const km = haversineKm(-43.5321, 172.6362, -36.8485, 174.7633);
    expect(km).toBeGreaterThan(750);
    expect(km).toBeLessThan(780);
  });

  it('returns a small distance for nearby points', () => {
    // ~1 km north of Christchurch centre
    const km = haversineKm(-43.5321, 172.6362, -43.5231, 172.6362);
    expect(km).toBeGreaterThan(0.9);
    expect(km).toBeLessThan(1.1);
  });
});

describe('formatDistance', () => {
  it('formats to one decimal place with km suffix', () => {
    expect(formatDistance(1.234)).toBe('1.2 km');
    expect(formatDistance(10)).toBe('10.0 km');
    expect(formatDistance(0)).toBe('0.0 km');
  });
});
