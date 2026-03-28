import { describe, it, expect } from 'vitest';
import {
  haversineDistance,
  fairnessScore,
  formatDistanceValue,
  formatMaxDistanceValue,
  formatDuration,
  computeCentroid,
  checkTooFarApart,
} from './utils.js';

describe('haversineDistance', () => {
  it('returns 0 for same point', () => {
    expect(haversineDistance(48.8566, 2.3522, 48.8566, 2.3522)).toBe(0);
  });

  it('computes Paris to Lyon (~392km)', () => {
    const d = haversineDistance(48.8566, 2.3522, 45.7640, 4.8357);
    expect(d).toBeGreaterThan(390000);
    expect(d).toBeLessThan(395000);
  });

  it('computes short distance (~1km)', () => {
    // ~1km north of Eiffel Tower
    const d = haversineDistance(48.8584, 2.2945, 48.8674, 2.2945);
    expect(d).toBeGreaterThan(900);
    expect(d).toBeLessThan(1100);
  });
});

describe('fairnessScore', () => {
  it('returns 0 for less than 2 distances', () => {
    expect(fairnessScore([500])).toBe(0);
    expect(fairnessScore([])).toBe(0);
  });

  it('returns 0 for equal distances', () => {
    expect(fairnessScore([1000, 1000, 1000])).toBe(0);
  });

  it('returns higher score for unequal distances', () => {
    const equal = fairnessScore([1000, 1000]);
    const unequal = fairnessScore([500, 1500]);
    expect(unequal).toBeGreaterThan(equal);
  });

  it('computes standard deviation correctly', () => {
    // [200, 400] → mean=300, variance=10000, std=100
    expect(fairnessScore([200, 400])).toBe(100);
  });
});

describe('formatDistanceValue', () => {
  it('formats meters in km mode', () => {
    expect(formatDistanceValue(500, 'km')).toBe('500m');
    expect(formatDistanceValue(1500, 'km')).toBe('1.5km');
    expect(formatDistanceValue(50, 'km')).toBe('50m');
  });

  it('formats meters in miles mode', () => {
    expect(formatDistanceValue(100, 'mi')).toBe('328ft');
    expect(formatDistanceValue(5000, 'mi')).toBe('3.1mi');
  });

  it('uses feet below half mile', () => {
    // 2640 feet = 0.5 miles = ~804.7m
    const result = formatDistanceValue(800, 'mi');
    expect(result).toMatch(/ft$/);
  });

  it('uses miles above half mile', () => {
    const result = formatDistanceValue(1000, 'mi');
    expect(result).toMatch(/mi$/);
  });
});

describe('formatMaxDistanceValue', () => {
  it('formats in km', () => {
    expect(formatMaxDistanceValue(10, 'km')).toBe('10km');
  });

  it('formats in miles', () => {
    expect(formatMaxDistanceValue(10, 'mi')).toBe('6.2mi');
  });
});

describe('formatDuration', () => {
  it('formats seconds to minutes', () => {
    expect(formatDuration(300)).toBe('5min');
    expect(formatDuration(90)).toBe('2min');
  });

  it('formats to hours and minutes', () => {
    expect(formatDuration(3900)).toBe('1h5min');
    expect(formatDuration(7200)).toBe('2h');
  });

  it('handles zero', () => {
    expect(formatDuration(0)).toBe('0min');
  });
});

describe('computeCentroid', () => {
  it('returns null for empty list', () => {
    expect(computeCentroid([])).toBeNull();
  });

  it('returns the point for single friend', () => {
    const result = computeCentroid([{ lat: 48.8566, lng: 2.3522 }]);
    expect(result.lat).toBeCloseTo(48.8566);
    expect(result.lng).toBeCloseTo(2.3522);
  });

  it('computes midpoint for two friends', () => {
    const result = computeCentroid([
      { lat: 48.0, lng: 2.0 },
      { lat: 50.0, lng: 4.0 },
    ]);
    expect(result.lat).toBeCloseTo(49.0);
    expect(result.lng).toBeCloseTo(3.0);
  });
});

describe('checkTooFarApart', () => {
  it('returns false for empty list', () => {
    expect(checkTooFarApart([], 10)).toBe(false);
  });

  it('returns false for single friend', () => {
    expect(checkTooFarApart([{ lat: 48.8566, lng: 2.3522 }], 10)).toBe(false);
  });

  it('returns false for close friends', () => {
    const friends = [
      { lat: 48.8566, lng: 2.3522 },
      { lat: 48.8606, lng: 2.3376 }, // ~1km apart
    ];
    expect(checkTooFarApart(friends, 10)).toBe(false);
  });

  it('returns true for distant friends', () => {
    const friends = [
      { lat: 48.8566, lng: 2.3522 }, // Paris
      { lat: 45.7640, lng: 4.8357 }, // Lyon
    ];
    expect(checkTooFarApart(friends, 10)).toBe(true);
  });

  it('checks all pairs', () => {
    const friends = [
      { lat: 48.8566, lng: 2.3522 },
      { lat: 48.8606, lng: 2.3376 }, // close to first
      { lat: 45.7640, lng: 4.8357 }, // far from both
    ];
    expect(checkTooFarApart(friends, 10)).toBe(true);
  });
});
