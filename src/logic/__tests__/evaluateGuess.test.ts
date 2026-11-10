import { evaluateGuess } from '../evaluateGuess';
import { describe, expect, it } from 'vitest';

describe('evaluateGuess', () => {
  it('counts bulls and cows separately', () => {
    expect(evaluateGuess('4271', '1234')).toEqual({ bulls: 1, cows: 2 });
  });

  it('counts every matching digit as a cow when no position is correct', () => {
    expect(evaluateGuess('4271', '1724')).toEqual({ bulls: 0, cows: 4 });
  });

  it('returns zero cows and all bulls for an exact guess', () => {
    expect(evaluateGuess('0123', '0123')).toEqual({ bulls: 4, cows: 0 });
  });

  it('compares hexadecimal digits without case sensitivity', () => {
    expect(evaluateGuess('a3F', 'FA0')).toEqual({ bulls: 0, cows: 2 });
  });

  it('rejects strings with different lengths', () => {
    expect(() => evaluateGuess('1234', '123')).toThrow(RangeError);
  });
});
