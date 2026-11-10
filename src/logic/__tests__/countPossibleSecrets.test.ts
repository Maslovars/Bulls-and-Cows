import { countPossibleSecrets } from '../countPossibleSecrets';
import { describe, expect, it } from 'vitest';

describe('countPossibleSecrets', () => {
  it('counts permutations for a decimal code', () => {
    expect(countPossibleSecrets(4, 10)).toBe(5040);
  });

  it('counts all possible two-digit binary codes, including a leading zero', () => {
    expect(countPossibleSecrets(2, 2)).toBe(2);
  });

  it('counts six-digit hexadecimal codes', () => {
    expect(countPossibleSecrets(6, 16)).toBe(5765760);
  });

  it('returns one for a zero-length selection', () => {
    expect(countPossibleSecrets(0, 10)).toBe(1);
  });

  it('returns zero when the requested length is impossible', () => {
    expect(countPossibleSecrets(3, 2)).toBe(0);
  });

  it('returns the same cached result on repeated calls', () => {
    const firstResult = countPossibleSecrets(5, 16);

    expect(countPossibleSecrets(5, 16)).toBe(firstResult);
  });
});
