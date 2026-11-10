const createMemoizedPermutationCounter = (): ((length: number, base: number) => number) => {
  const cache = new Map<string, number>();

  const countRecursively = (length: number, base: number): number => {
    if (
      !Number.isInteger(length) ||
      !Number.isInteger(base) ||
      length < 0 ||
      base < 0 ||
      length > base
    ) {
      return 0;
    }

    if (length === 0) {
      return 1;
    }

    const cacheKey = `${length}:${base}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult !== undefined) {
      return cachedResult;
    }

    const result = base * countRecursively(length - 1, base - 1);
    cache.set(cacheKey, result);

    return result;
  };

  return countRecursively;
};

export const countPossibleSecrets = createMemoizedPermutationCounter();
