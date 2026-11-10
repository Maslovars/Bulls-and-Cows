import type { GameState, GuessEntry, NumberBase } from './types';

export interface NewGameOptions {
  readonly length: number;
  readonly base: NumberBase;
  readonly secret: string;
  readonly startedAt: number;
}

export const createGameState = ({
  length,
  base,
  secret,
  startedAt,
}: NewGameOptions): GameState => ({
  status: 'playing',
  length,
  base,
  secret,
  history: [],
  startedAt,
  finishedAt: null,
});

/** Returns a new state and a new history array; the previous state is untouched. */
export const appendGuess = (state: GameState, entry: GuessEntry, finishedAt: number): GameState => {
  if (state.status === 'won') {
    return state;
  }

  const hasWon = entry.bulls === state.length;

  return {
    ...state,
    history: [...state.history, entry],
    status: hasWon ? 'won' : 'playing',
    finishedAt: hasWon ? finishedAt : null,
  };
};

export const hasPreviousGuess = (history: readonly GuessEntry[], guess: string): boolean =>
  history.some((entry) => entry.value.toLowerCase() === guess.toLowerCase());
