import { DIGIT_ALPHABET } from './constants';

export const createDigitValidator = (base: number): ((char: string) => boolean) => {
  if (!Number.isInteger(base) || base < 2 || base > DIGIT_ALPHABET.length) {
    throw new RangeError('Base must be an integer between 2 and 16.');
  }

  const allowedDigits = new Set(DIGIT_ALPHABET.slice(0, base).toLowerCase());

  return (char: string): boolean => char.length === 1 && allowedDigits.has(char.toLowerCase());
};
