import { isValidGuess } from '../isValidGuess';
import { describe, expect, it } from 'vitest';

describe('isValidGuess', () => {
  it('accepts a decimal guess with unique digits', () => {
    expect(isValidGuess('0123', 4, 10)).toBe(true);
  });

  it('accepts uppercase hexadecimal digits', () => {
    expect(isValidGuess('A3F0', 4, 16)).toBe(true);
  });

  it('rejects a guess with repeated digits regardless of letter case', () => {
    expect(isValidGuess('aA3F', 4, 16)).toBe(false);
  });

  it('rejects a guess with the wrong length', () => {
    expect(isValidGuess('123', 4, 10)).toBe(false);
  });

  it('rejects digits outside the selected number system', () => {
    expect(isValidGuess('1021', 4, 2)).toBe(false);
  });

  it('rejects a requested length that is larger than the base', () => {
    expect(isValidGuess('010', 3, 2)).toBe(false);
  });
});
