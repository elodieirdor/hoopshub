import { haversineKm, formatDistance } from '../geo';

describe('haversineKm', () => {
  it('returns 0 for the same point', () => {
    expect(haversineKm(-43.5321, 172.6362, -43.5321, 172.6362)).toBe(0);
  });

  it('is symmetric', () => {
    const ab = haversineKm(-43.5321, 172.6362, -36.8485, 174.7633);
    const ba = haversineKm(-36.8485, 174.7633, -43.5321, 172.6362);
    expect(ab).toBeCloseTo(ba, 5);
  });

  it('calculates Christchurch → Auckland ≈ 764 km', () => {
    // Christchurch: -43.5321, 172.6362  Auckland: -36.8485, 174.7633
    const km = haversineKm(-43.5321, 172.6362, -36.8485, 174.7633);
    expect(km).toBeGreaterThan(750);
    expect(km).toBeLessThan(780);
  });

  it('calculates a short distance correctly', () => {
    // ~1.1 km north
    const km = haversineKm(0, 0, 0.01, 0);
    expect(km).toBeCloseTo(1.1132, 2);
  });
});

describe('formatDistance', () => {
  it('formats to one decimal place with km suffix', () => {
    expect(formatDistance(1.234)).toBe('1.2 km');
    expect(formatDistance(10)).toBe('10.0 km');
    expect(formatDistance(0.5)).toBe('0.5 km');
  });

  it('rounds correctly', () => {
    expect(formatDistance(1.96)).toBe('2.0 km');
    expect(formatDistance(1.94)).toBe('1.9 km');
  });
});
