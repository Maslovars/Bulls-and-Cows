import { sortLeaderboard } from '../leaderboard';
import { describe, expect, it } from 'vitest';
import type { LeaderboardRecord } from '../types';

const records: LeaderboardRecord[] = [
  { id: 'slow', base: 10, length: 4, attempts: 4, timeMs: 90000, completedAt: 3 },
  { id: 'few', base: 16, length: 4, attempts: 2, timeMs: 110000, completedAt: 2 },
  { id: 'fast', base: 8, length: 3, attempts: 4, timeMs: 30000, completedAt: 1 },
];

describe('sortLeaderboard', () => {
  it('sorts by attempts first and time second', () => {
    expect(sortLeaderboard(records).map((record) => record.id)).toEqual(['few', 'fast', 'slow']);
  });

  it('returns a new array and keeps the original order untouched', () => {
    const sorted = sortLeaderboard(records);

    expect(sorted).not.toBe(records);
    expect(records.map((record) => record.id)).toEqual(['slow', 'few', 'fast']);
  });

  it('limits the number of returned records', () => {
    expect(sortLeaderboard(records, 2)).toHaveLength(2);
  });
});
