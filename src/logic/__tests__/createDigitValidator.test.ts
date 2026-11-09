import { createDigitValidator } from '../createDigitValidator';
import { describe, expect, it } from 'vitest';

describe('createDigitValidator', () => {
  it('creates a predicate for binary digits', () => {
    const isBinaryDigit = createDigitValidator(2);

    expect(isBinaryDigit('0')).toBe(true);
    expect(isBinaryDigit('1')).toBe(true);
    expect(isBinaryDigit('2')).toBe(false);
  });

  it('accepts hexadecimal letters in either case', () => {
    const isHexDigit = createDigitValidator(16);

    expect(isHexDigit('A')).toBe(true);
    expect(isHexDigit('f')).toBe(true);
    expect(isHexDigit('G')).toBe(false);
  });

  it('rejects empty and multi-character values', () => {
    const isDecimalDigit = createDigitValidator(10);

    expect(isDecimalDigit('')).toBe(false);
    expect(isDecimalDigit('12')).toBe(false);
  });

  it('rejects an unsupported base', () => {
    expect(() => createDigitValidator(1)).toThrow(RangeError);
  });
});
