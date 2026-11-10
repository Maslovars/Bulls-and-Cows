import { LEADERBOARD_LIMIT } from './constants';
import type { LeaderboardRecord } from './types';

export const sortLeaderboard = (
  records: readonly LeaderboardRecord[],
  limit = LEADERBOARD_LIMIT,
): LeaderboardRecord[] =>
  [...records]
    .sort(
      (first, second) =>
        first.attempts - second.attempts ||
        first.timeMs - second.timeMs ||
        first.completedAt - second.completedAt,
    )
    .slice(0, Math.max(0, limit));
