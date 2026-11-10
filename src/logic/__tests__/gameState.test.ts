import { appendGuess, createGameState, hasPreviousGuess } from '../gameState';
import { describe, expect, it } from 'vitest';
import type { GuessEntry } from '../types';

const initialState = () =>
  createGameState({
    length: 4,
    base: 10,
    secret: '0123',
    startedAt: 1000,
  });

describe('gameState', () => {
  it('appends a guess immutably', () => {
    const previousState = initialState();
    const entry: GuessEntry = { value: '4271', bulls: 1, cows: 2 };
    const nextState = appendGuess(previousState, entry, 2000);

    expect(previousState.history).toHaveLength(0);
    expect(nextState.history).toEqual([entry]);
    expect(nextState.history).not.toBe(previousState.history);
    expect(nextState).not.toBe(previousState);
  });

  it('marks the game as won and stores the finish time', () => {
    const nextState = appendGuess(initialState(), { value: '0123', bulls: 4, cows: 0 }, 2500);

    expect(nextState.status).toBe('won');
    expect(nextState.finishedAt).toBe(2500);
  });

  it('does not modify a completed game', () => {
    const wonState = appendGuess(initialState(), { value: '0123', bulls: 4, cows: 0 }, 2500);
    const nextState = appendGuess(wonState, { value: '9999', bulls: 0, cows: 0 }, 3000);

    expect(nextState).toBe(wonState);
    expect(nextState.history).toHaveLength(1);
  });

  it('detects a repeated guess without case sensitivity', () => {
    const history: GuessEntry[] = [{ value: 'a3F', bulls: 0, cows: 2 }];

    expect(hasPreviousGuess(history, 'A3f')).toBe(true);
    expect(hasPreviousGuess(history, 'A3E')).toBe(false);
  });
});
