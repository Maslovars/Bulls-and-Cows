# Design notes

## 1. Data structures and algorithms

### Game state

The game state is a plain TypeScript object (`GameState`, `src/logic/types.ts`). It contains:

- the immutable round settings: secret length and number base;
- the secret sequence as a string, not a number, so leading zeroes are preserved;
- a readonly history of `GuessEntry` records;
- the round status and start/finish timestamps.

A guess is represented by a small object: `{ value, bulls, cows }`. The history is a readonly array. `appendGuess` (`src/logic/gameState.ts`) returns a new state object and creates the next history with `[...state.history, entry]`. It never changes an earlier state or its history. `hasPreviousGuess` checks duplicates case-insensitively.

The UI keeps the current state in a local variable and replaces it with the return value of a pure state helper. DOM operations are confined to `src/ui/`; the logic modules do not read or write the DOM.

### `generateSecret(length, base, random)`

The function takes the first `base` symbols from the digit alphabet and performs a partial Fisher-Yates shuffle for the first `length` positions. At each position, it selects an index from the still-unselected suffix. The shuffle is recursive and creates a new array with `map` at every step instead of mutating the input array. The first `length` symbols form the secret. The injected random source makes the result deterministic in tests and lets production use `Math.random` by default.

The secret is a string, so a value such as `0123` is not converted into the number `123`.

### `evaluateGuess(secret, guess)`

Both strings are normalized with `toLowerCase()` before comparison. Bulls are counted by mapping each secret digit to a positional equality result and filtering the matching results. A `Set` of the guess digits is then used to count all digits shared with the secret; cows are the shared-digit count minus bulls. This keeps the algorithm declarative and avoids manual counter loops.

### `countPossibleSecrets(length, base)`

The number of possible unique sequences is the permutation:

`P(base, length) = base × (base − 1) × ... × (base − length + 1)`.

The recursive relation is:

`P(base, length) = base × P(base − 1, length − 1)`

with `P(base, 0) = 1` and `P(base, length) = 0` when the requested length is invalid or greater than the base. A closure owns a `Map` cache keyed by `length:base`; previously computed arguments return immediately. Leading zeroes are included because every symbol in the base alphabet is eligible for every position.

### Leaderboard

Each `LeaderboardRecord` stores an id, base, length, attempt count, elapsed milliseconds and completion timestamp. `sortLeaderboard` sorts a copy of the input array, first by fewer attempts and then by faster time. The storage adapter in `src/services/leaderboardStorage.ts` is the only module that accesses `localStorage`; malformed or unavailable storage is handled without breaking a round.

## 2. Complexity (Big O)

Let `n` be the code length and `b` the number of symbols in the selected base.

| Function                     | Time                   | Additional space | Reason                                                                                                                                                                                                                                  |
| ---------------------------- | ---------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `generateSecret(n, b)`       | `O(b × n)`             | `O(b × n)`       | Each of the `n` recursive shuffle steps maps over the current array, whose length is at most `b`. The immutable copies and recursive frames account for the same upper bound.                                                           |
| `evaluateGuess(n)`           | `O(n)` expected        | `O(n)`           | It creates normalized arrays and a `Set`; array operations visit the digits a constant number of times and `Set.has` is expected `O(1)`.                                                                                                |
| `isValidGuess(n, b)`         | `O(b + n)` expected    | `O(b + n)`       | It builds the allowed-digit `Set` in `O(b)`, validates `n` characters with expected `O(1)` membership checks and uses another `Set` to check uniqueness. Since this game caps `b` at 16, this behaves as `O(n)` for supported settings. |
| `countPossibleSecrets(n, b)` | `O(n)` for a cold call | `O(n)`           | A cold recursive call visits at most `n` decreasing `(length, base)` states, each with constant-time arithmetic and expected constant-time `Map` operations. A repeated call for the same pair is `O(1)` from the cache.                |

The number base is restricted to at most 16 in this game, but the bounds above are stated in terms of `b` to make the algorithms clear.

## 3. Clean-code and functional-programming principles

- **Single responsibility:** secret generation, validation, evaluation, state updates, leaderboard sorting and browser storage are in separate modules (`src/logic/`, `src/services/`, `src/ui/`).
- **Pure functions and dependency injection:** `generateSecret` receives its random source as an argument; `evaluateGuess`, `isValidGuess`, `createDigitValidator`, `countPossibleSecrets`, `appendGuess`, `hasPreviousGuess` and `sortLeaderboard` do not access browser APIs or mutate caller-owned data.
- **Immutability:** `appendGuess` spreads the old state and builds a new history array; `sortLeaderboard` sorts a copy rather than the caller's array; the recursive shuffle builds new arrays.
- **Higher-order functions:** `evaluateGuess` uses `map` and `filter`; `isValidGuess` uses `every` and `map`; `createDigitValidator` returns a predicate that is reused by full-guess validation and the live input filter.
- **Currying / function factories:** `createDigitValidator(base)` builds a `Set` for the chosen alphabet, binds the number base once and returns a one-character predicate.
- **Memoization and recursion:** `countPossibleSecrets` uses a recursive permutation relation with a closure-scoped `Map` cache.
- **Guard clauses and explicit errors:** public logic functions validate their arguments early. Invalid random values and impossible secret lengths produce `RangeError`; an invalid player guess is rejected before it can enter history.
- **Meaningful names and constants:** supported bases, length bounds, the digit alphabet and leaderboard size are centralized in `src/logic/constants.ts`.
- **No unnecessary classes:** the game domain is represented with typed data and functions; there are no classes in the game logic.
- **Separation of concerns:** UI rendering uses DOM creation methods in `src/ui/` and does not use `innerHTML` or `insertAdjacentHTML`. Browser storage is isolated in a service adapter.
