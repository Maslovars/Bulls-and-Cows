import { LEADERBOARD_LIMIT, SUPPORTED_BASES } from '../logic/constants';
import { sortLeaderboard } from '../logic/leaderboard';
import type { LeaderboardRecord, NumberBase } from '../logic/types';

const STORAGE_KEY = 'bulls-and-cows:leaderboard:v1';

const isLeaderboardRecord = (value: unknown): value is LeaderboardRecord => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === 'string' &&
    SUPPORTED_BASES.includes(record.base as NumberBase) &&
    Number.isInteger(record.length) &&
    Number.isInteger(record.attempts) &&
    Number.isFinite(record.timeMs) &&
    Number.isFinite(record.completedAt) &&
    Number(record.length) >= 2 &&
    Number(record.length) <= Number(record.base) &&
    Number(record.attempts) > 0 &&
    Number(record.timeMs) >= 0
  );
};

export const loadLeaderboard = (): LeaderboardRecord[] => {
  try {
    const serializedRecords = localStorage.getItem(STORAGE_KEY);

    if (!serializedRecords) {
      return [];
    }

    const parsedRecords: unknown = JSON.parse(serializedRecords);

    if (!Array.isArray(parsedRecords)) {
      return [];
    }

    return sortLeaderboard(parsedRecords.filter(isLeaderboardRecord));
  } catch {
    return [];
  }
};

export const saveLeaderboardRecord = (record: LeaderboardRecord): void => {
  try {
    const updatedRecords = sortLeaderboard([...loadLeaderboard(), record], LEADERBOARD_LIMIT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
  } catch (error) {
    console.warn('error:', error);
  }
};
