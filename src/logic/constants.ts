import type { NumberBase } from './types';

export const SUPPORTED_BASES: readonly NumberBase[] = [2, 8, 10, 16];
export const MIN_SECRET_LENGTH = 2;
export const MAX_SECRET_LENGTH = 6;
export const LEADERBOARD_LIMIT = 10;
export const DIGIT_ALPHABET = '0123456789ABCDEF';

export const getBaseName = (base: NumberBase): string => {
  const names: Record<NumberBase, string> = {
    2: 'Binary',
    8: 'Octal',
    10: 'Decimal',
    16: 'Hexadecimal',
  };

  return names[base];
};

export const getBaseShortName = (base: NumberBase): string => {
  const names: Record<NumberBase, string> = {
    2: 'BIN',
    8: 'OCT',
    10: 'DEC',
    16: 'HEX',
  };

  return names[base];
};
