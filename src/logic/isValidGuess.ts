import { createDigitValidator } from './createDigitValidator';

export const isValidGuess = (guess: string, length: number, base: number): boolean => {
  if (
    !Number.isInteger(base) ||
    base < 2 ||
    base > 16 ||
    !Number.isInteger(length) ||
    length < 1 ||
    length > base ||
    guess.length !== length
  ) {
    return false;
  }

  const isAllowedDigit = createDigitValidator(base);
  const digits = Array.from(guess);
  const normalizedDigits = digits.map((digit) => digit.toLowerCase());

  return digits.every(isAllowedDigit) && new Set(normalizedDigits).size === length;
};
