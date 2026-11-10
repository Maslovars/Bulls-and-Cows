import { DIGIT_ALPHABET } from './constants';

export const generateSecret = (
  length: number,
  base: number,
  random: () => number = Math.random,
): string => {
  if (!Number.isInteger(base) || base < 2 || base > DIGIT_ALPHABET.length) {
    throw new RangeError('Base must be an integer between 2 and 16.');
  }

  if (!Number.isInteger(length) || length < 1 || length > base) {
    throw new RangeError('Length must be an integer between 1 and the selected base.');
  }

  const shuffle = (digits: readonly string[], position: number): readonly string[] => {
    if (position === length) {
      return digits;
    }

    const randomValue = random();

    if (randomValue < 0 || randomValue >= 1 || !Number.isFinite(randomValue)) {
      throw new RangeError('The random source must return a number in [0, 1).');
    }

    const swapPosition = position + Math.floor(randomValue * (digits.length - position));
    const nextDigits = digits.map((digit, index) => {
      if (index === position) {
        return digits[swapPosition];
      }

      if (index === swapPosition) {
        return digits[position];
      }

      return digit;
    });

    return shuffle(nextDigits, position + 1);
  };

  return shuffle(Array.from(DIGIT_ALPHABET.slice(0, base)), 0)
    .slice(0, length)
    .join('');
};
