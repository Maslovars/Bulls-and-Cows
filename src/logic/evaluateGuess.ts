import type { GuessEvaluation } from './types';

export const evaluateGuess = (secret: string, guess: string): GuessEvaluation => {
  if (secret.length !== guess.length) {
    throw new RangeError('Secret and guess must have the same length.');
  }

  const secretDigits = Array.from(secret.toLowerCase());
  const guessDigits = Array.from(guess.toLowerCase());
  const guessDigitSet = new Set(guessDigits);

  const bulls = secretDigits
    .map((digit, index) => digit === guessDigits[index])
    .filter(Boolean).length;

  const matchingDigits = secretDigits.filter((digit) => guessDigitSet.has(digit)).length;

  return {
    bulls,
    cows: matchingDigits - bulls,
  };
};
