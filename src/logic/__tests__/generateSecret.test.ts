import { generateSecret } from '../generateSecret';
import { describe, expect, it } from 'vitest';

describe('generateSecret', () => {
  it('uses the injected random source to generate a predictable code', () => {
    expect(generateSecret(4, 10, () => 0)).toBe('0123');
  });

  it('returns the requested amount of unique digits from the selected base', () => {
    const secret = generateSecret(6, 16, () => 0.73);

    expect(secret).toHaveLength(6);
    expect(new Set(secret).size).toBe(6);
    expect(Array.from(secret).every((digit) => '0123456789ABCDEF'.includes(digit))).toBe(true);
  });

  it('allows a leading zero', () => {
    expect(generateSecret(2, 2, () => 0)).toBe('01');
  });

  it('rejects a length that cannot fit unique digits in the base', () => {
    expect(() => generateSecret(3, 2, () => 0)).toThrow(RangeError);
  });

  it('rejects a random source that returns a value outside [0, 1)', () => {
    expect(() => generateSecret(2, 10, () => 1)).toThrow(RangeError);
  });
});
