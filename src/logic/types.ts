export type NumberBase = 2 | 8 | 10 | 16;

export type GameStatus = 'playing' | 'won';

export interface GuessEvaluation {
  readonly bulls: number;
  readonly cows: number;
}

export interface GuessEntry extends GuessEvaluation {
  readonly value: string;
}

export interface GameState {
  readonly status: GameStatus;
  readonly length: number;
  readonly base: NumberBase;
  readonly secret: string;
  readonly history: readonly GuessEntry[];
  readonly startedAt: number;
  readonly finishedAt: number | null;
}

export interface LeaderboardRecord {
  readonly id: string;
  readonly base: NumberBase;
  readonly length: number;
  readonly attempts: number;
  readonly timeMs: number;
  readonly completedAt: number;
}
