import { countPossibleSecrets } from '../logic/countPossibleSecrets';
import { createDigitValidator } from '../logic/createDigitValidator';
import {
  getBaseName,
  getBaseShortName,
  LEADERBOARD_LIMIT,
  MAX_SECRET_LENGTH,
  MIN_SECRET_LENGTH,
  SUPPORTED_BASES,
} from '../logic/constants';
import { evaluateGuess } from '../logic/evaluateGuess';
import { generateSecret } from '../logic/generateSecret';
import { appendGuess, createGameState, hasPreviousGuess } from '../logic/gameState';
import { isValidGuess } from '../logic/isValidGuess';
import { sortLeaderboard } from '../logic/leaderboard';
import type { GameState, LeaderboardRecord, NumberBase } from '../logic/types';
import { loadLeaderboard, saveLeaderboardRecord } from '../services/leaderboardStorage';
import { createButton, createElement, createLabeledControl } from './dom';

const root: HTMLElement = document.body;

let selectedBase: NumberBase = 10;
let selectedLength = 4;
let gameState: GameState | null = null;
let timerId: number | undefined;

const formatDuration = (milliseconds: number): string => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const formatNumber = (value: number): string => new Intl.NumberFormat('en-US').format(value);

const createPageHeader = (): HTMLElement => {
  const header = createElement('header', 'topbar');
  const brand = createElement('a', 'brand');
  brand.href = './';
  brand.setAttribute('aria-label', 'Bulls and Cows home');

  const brandMark = createElement('span', 'brand__mark', 'B&C');
  const brandCopy = createElement('span', 'brand__copy');
  brandCopy.append(
    createElement('strong', 'brand__name', 'Bulls & Cows'),
    createElement('span', 'brand__tagline', 'A little logic goes a long way'),
  );
  brand.append(brandMark, brandCopy);

  const status = createElement('div', 'topbar__status');
  status.append(
    createElement('span', 'status-dot'),
    createElement('span', '', 'Local game · no account needed'),
  );
  header.append(brand, status);
  return header;
};

const createIntro = (eyebrow: string, title: string, description: string): HTMLElement => {
  const intro = createElement('section', 'intro');
  intro.append(
    createElement('p', 'eyebrow', eyebrow),
    createElement('h1', 'intro__title', title),
    createElement('p', 'intro__description', description),
  );
  return intro;
};

const createLeaderboardPanel = (records: readonly LeaderboardRecord[]): HTMLElement => {
  const panel = createElement('aside', 'panel leaderboard-panel');
  const heading = createElement('div', 'panel__heading');
  heading.append(
    createElement('div', '', 'HALL OF FAME'),
    createElement('span', 'panel__counter', `${records.length}/${LEADERBOARD_LIMIT}`),
  );
  panel.append(heading, createElement('h2', 'panel__title', 'Best rounds'));

  if (records.length === 0) {
    const empty = createElement('div', 'empty-state');
    empty.append(
      createElement('span', 'empty-state__icon', '✦'),
      createElement('p', 'empty-state__title', 'Your name belongs here'),
      createElement('p', 'empty-state__text', 'Win a round to set your first record.'),
    );
    panel.append(empty);
    return panel;
  }

  const list = createElement('ol', 'leaderboard-list');
  records.forEach((record, index) => {
    const item = createElement('li', 'leaderboard-item');
    const rank = createElement('span', 'leaderboard-item__rank', `${index + 1}`.padStart(2, '0'));
    const details = createElement('div', 'leaderboard-item__details');
    details.append(
      createElement(
        'strong',
        'leaderboard-item__main',
        `${record.attempts} ${record.attempts === 1 ? 'attempt' : 'attempts'}`,
      ),
      createElement(
        'span',
        'leaderboard-item__meta',
        `${record.length} digits · ${getBaseShortName(record.base)}`,
      ),
    );
    const time = createElement('span', 'leaderboard-item__time', formatDuration(record.timeMs));
    item.append(rank, details, time);
    list.append(item);
  });

  panel.append(list);
  return panel;
};

const createRulesPanel = (): HTMLElement => {
  const panel = createElement('aside', 'panel rules-panel');
  panel.append(
    createElement('div', 'panel__heading', 'HOW TO PLAY'),
    createElement('h2', 'panel__title', 'Read the clues'),
  );

  const rules = [
    ['01', 'Bulls', 'A correct digit in the correct position.'],
    ['02', 'Cows', 'A correct digit in the wrong position.'],
    ['03', 'No repeats', 'Every digit in the secret code is unique.'],
  ];

  const list = createElement('ul', 'rules-list');
  rules.forEach(([number, title, description]) => {
    const item = createElement('li', 'rules-list__item');
    item.append(
      createElement('span', 'rules-list__number', number),
      createElement('div', 'rules-list__copy'),
    );
    const copy = item.querySelector('.rules-list__copy');

    if (copy) {
      copy.append(createElement('strong', '', title), createElement('span', '', description));
    }

    list.append(item);
  });

  panel.append(list);
  return panel;
};

const renderSettings = (): void => {
  if (timerId !== undefined) {
    window.clearInterval(timerId);
    timerId = undefined;
  }

  const page = createElement('div', 'page-shell');
  page.append(createPageHeader());

  const main = createElement('main', 'main-layout');
  const content = createElement('div', 'main-layout__content');
  content.append(
    createIntro(
      'THE CODE-BREAKING CLASSIC',
      'Can you crack the code?',
      'A secret sequence is waiting. Read the clues, sharpen your logic and find the hidden digits.',
    ),
  );

  const settingsCard = createElement('section', 'panel settings-card');
  settingsCard.append(
    createElement('div', 'panel__heading', '01 / ROUND SETUP'),
    createElement('h2', 'panel__title', 'Set your challenge'),
    createElement(
      'p',
      'panel__description',
      'Choose a number system and the length of your secret code.',
    ),
  );

  const controls = createElement('div', 'settings-grid');
  const baseSelect = createElement('select', 'form-control');
  baseSelect.id = 'base-select';
  SUPPORTED_BASES.forEach((base) => {
    const option = createElement('option', '', `${getBaseName(base)} (${getBaseShortName(base)})`);
    option.value = String(base);
    option.selected = base === selectedBase;
    baseSelect.append(option);
  });
  baseSelect.addEventListener('change', () => {
    selectedBase = Number(baseSelect.value) as NumberBase;
    selectedLength = Math.min(selectedLength, selectedBase, MAX_SECRET_LENGTH);
    renderSettings();
  });

  const lengthSelect = createElement('select', 'form-control');
  lengthSelect.id = 'length-select';
  Array.from(
    { length: MAX_SECRET_LENGTH - MIN_SECRET_LENGTH + 1 },
    (_, index) => MIN_SECRET_LENGTH + index,
  ).forEach((length) => {
    const option = createElement('option', '', `${length} digits`);
    option.value = String(length);
    option.disabled = length > selectedBase;
    option.selected = length === selectedLength;
    lengthSelect.append(option);
  });
  lengthSelect.addEventListener('change', () => {
    selectedLength = Number(lengthSelect.value);
    renderSettings();
  });

  controls.append(
    createLabeledControl('Number system', baseSelect),
    createLabeledControl('Secret length', lengthSelect),
  );

  const possibilities = createElement('div', 'possibilities');
  possibilities.append(
    createElement('span', 'possibilities__label', 'Possible secret codes'),
    createElement(
      'strong',
      'possibilities__value',
      formatNumber(countPossibleSecrets(selectedLength, selectedBase)),
    ),
  );

  const startButton = createButton(
    'Start a new round',
    'button button--primary button--wide',
    () => {
      const secret = generateSecret(selectedLength, selectedBase);
      gameState = createGameState({
        length: selectedLength,
        base: selectedBase,
        secret,
        startedAt: Date.now(),
      });
      renderGame();
    },
  );

  settingsCard.append(controls, possibilities, startButton);
  content.append(settingsCard);

  const sidebar = createElement('div', 'main-layout__sidebar');
  sidebar.append(createRulesPanel(), createLeaderboardPanel(loadLeaderboard()));
  main.append(content, sidebar);

  page.append(main);
  root.replaceChildren(page);
};

const createHistoryPanel = (state: GameState): HTMLElement => {
  const panel = createElement('section', 'panel history-panel');
  const header = createElement('div', 'history-panel__header');
  header.append(
    createElement('div', '', 'ROUND HISTORY'),
    createElement(
      'span',
      'history-panel__count',
      `${state.history.length} ${state.history.length === 1 ? 'guess' : 'guesses'}`,
    ),
  );
  panel.append(header, createElement('h2', 'panel__title', 'Your attempts'));

  if (state.history.length === 0) {
    const empty = createElement('div', 'history-empty');
    empty.append(
      createElement('span', 'history-empty__symbol', '⌁'),
      createElement('p', 'history-empty__title', 'No guesses yet'),
      createElement('p', 'history-empty__text', 'Your attempts and clues will appear here.'),
    );
    panel.append(empty);
    return panel;
  }

  const table = createElement('table', 'history-table');
  const tableHead = createElement('thead');
  const headingRow = createElement('tr');
  ['#', 'Your guess', 'Bulls', 'Cows'].forEach((heading) => {
    headingRow.append(createElement('th', '', heading));
  });
  tableHead.append(headingRow);

  const body = createElement('tbody');
  state.history.forEach((entry, index) => {
    const row = createElement('tr');
    row.append(
      createElement('td', 'history-table__index', String(index + 1).padStart(2, '0')),
      createElement('td', 'history-table__guess', entry.value.toUpperCase()),
      createElement('td', 'history-table__bulls', String(entry.bulls)),
      createElement('td', 'history-table__cows', String(entry.cows)),
    );
    body.append(row);
  });

  table.append(tableHead, body);
  panel.append(table);
  return panel;
};

const renderGame = (message = ''): void => {
  if (timerId !== undefined) {
    window.clearInterval(timerId);
    timerId = undefined;
  }

  if (!gameState) {
    renderSettings();
    return;
  }

  const state = gameState;
  const isWon = state.status === 'won';
  const page = createElement('div', 'page-shell');
  page.append(createPageHeader());

  const main = createElement('main', 'main-layout main-layout--game');
  const content = createElement('div', 'main-layout__content');
  content.append(
    createIntro(
      isWon ? 'CODE CRACKED' : 'THE ROUND IS LIVE',
      isWon ? 'You found the code!' : 'Make your next move.',
      isWon
        ? 'A sharp eye and a little patience did the trick. Your result has been saved to the leaderboard.'
        : 'Enter a unique sequence of digits. Each guess gives you a new clue.',
    ),
  );

  const gameCard = createElement('section', `panel game-card${isWon ? ' game-card--won' : ''}`);
  const gameCardHeader = createElement('div', 'game-card__header');
  const roundLabel = createElement('div', 'panel__heading', '02 / CODE BREAKING');
  const settingsBadge = createElement(
    'span',
    'settings-badge',
    `${state.length} DIGITS · ${getBaseShortName(state.base)}`,
  );
  gameCardHeader.append(roundLabel, settingsBadge);

  const metrics = createElement('div', 'metrics-row');
  const attemptsMetric = createElement('div', 'metric');
  attemptsMetric.append(
    createElement('span', 'metric__label', 'ATTEMPTS'),
    createElement('strong', 'metric__value', String(state.history.length).padStart(2, '0')),
  );
  const timerMetric = createElement('div', 'metric');
  timerMetric.append(
    createElement('span', 'metric__label', 'ELAPSED TIME'),
    createElement(
      'strong',
      'metric__value',
      formatDuration((state.finishedAt ?? Date.now()) - state.startedAt),
    ),
  );
  timerMetric.querySelector('.metric__value')?.setAttribute('id', 'elapsed-time');
  metrics.append(attemptsMetric, timerMetric);

  gameCard.append(gameCardHeader, metrics);

  if (isWon) {
    const result = createElement('div', 'win-result');
    result.append(
      createElement('span', 'win-result__icon', '✦'),
      createElement('p', 'win-result__label', 'SECRET CODE'),
      createElement('strong', 'win-result__code', state.secret),
      createElement(
        'p',
        'win-result__copy',
        `Solved in ${state.history.length} ${state.history.length === 1 ? 'attempt' : 'attempts'} and ${formatDuration((state.finishedAt ?? Date.now()) - state.startedAt)}.`,
      ),
    );
    gameCard.append(result);
    gameCard.append(
      createButton('Play another round', 'button button--primary button--wide', () => {
        gameState = null;
        renderSettings();
      }),
    );
  } else {
    const form = createElement('form', 'guess-form');
    const inputLabel = createElement('label', 'field');
    inputLabel.htmlFor = 'guess-input';
    inputLabel.append(
      createElement('span', 'field__label', `Your guess · ${state.length} unique digits`),
    );

    const inputRow = createElement('div', 'guess-form__row');
    const guessInput = createElement('input', 'form-control guess-input');
    guessInput.id = 'guess-input';
    guessInput.name = 'guess';
    guessInput.type = 'text';
    guessInput.autocomplete = 'off';
    guessInput.spellcheck = false;
    guessInput.inputMode =
      state.base === 2 || state.base === 8 || state.base === 10 ? 'numeric' : 'text';
    guessInput.maxLength = state.length;
    guessInput.placeholder = 'e.g. 4271';
    guessInput.setAttribute('aria-describedby', 'guess-feedback');

    const digitValidator = createDigitValidator(state.base);
    guessInput.addEventListener('input', () => {
      const allowedDigits = Array.from(guessInput.value)
        .filter(digitValidator)
        .slice(0, state.length)
        .join('');
      guessInput.value = state.base === 16 ? allowedDigits.toUpperCase() : allowedDigits;
    });

    const submitButton = createElement('button', 'button button--primary', 'Check guess');
    submitButton.type = 'submit';
    inputRow.append(guessInput, submitButton);
    inputLabel.append(inputRow);

    const feedback = createElement('p', 'form-feedback', message || ' ');
    feedback.id = 'guess-feedback';
    feedback.setAttribute('aria-live', 'polite');

    form.append(inputLabel, feedback);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const guess = guessInput.value;

      if (!isValidGuess(guess, state.length, state.base)) {
        feedback.textContent = `Enter exactly ${state.length} unique valid digits.`;
        feedback.classList.add('form-feedback--error');
        return;
      }

      if (hasPreviousGuess(state.history, guess)) {
        feedback.textContent = 'You have already tried this sequence. Try another one.';
        feedback.classList.add('form-feedback--error');
        return;
      }

      const evaluation = evaluateGuess(state.secret, guess);
      gameState = appendGuess(state, { value: guess.toUpperCase(), ...evaluation }, Date.now());

      if (gameState.status === 'won') {
        const finishedAt = gameState.finishedAt ?? Date.now();
        saveLeaderboardRecord({
          id: crypto.randomUUID(),
          base: state.base,
          length: state.length,
          attempts: gameState.history.length,
          timeMs: finishedAt - state.startedAt,
          completedAt: finishedAt,
        });
      }

      renderGame();
    });

    gameCard.append(form);
  }

  content.append(gameCard, createHistoryPanel(state));

  const sidebar = createElement('div', 'main-layout__sidebar');
  sidebar.append(createRulesPanel(), createLeaderboardPanel(sortLeaderboard(loadLeaderboard())));
  main.append(content, sidebar);
  page.append(main);
  root.replaceChildren(page);

  if (!isWon) {
    const elapsedElement = root.querySelector<HTMLElement>('#elapsed-time');
    timerId = window.setInterval(() => {
      if (elapsedElement) {
        elapsedElement.textContent = formatDuration(Date.now() - state.startedAt);
      }
    }, 1000);
    root.querySelector<HTMLInputElement>('#guess-input')?.focus();
  } else if (timerId !== undefined) {
    window.clearInterval(timerId);
    timerId = undefined;
  }
};

export const startApp = (): void => {
  renderSettings();
};
