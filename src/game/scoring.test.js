import { describe, it, expect } from 'vitest';
import {
  normalizeGuess,
  isCorrectGuess,
  calculateGuesserPoints,
  calculateDrawerPoints,
  canPlayerGuess,
  ROUND_TIME_SECONDS
} from './scoring.js';

describe('Scoring Engine', () => {
  it('normalizes guesses by trimming and ignoring case/punctuation', () => {
    expect(normalizeGuess('  apple! ')).toBe('APPLE');
    expect(normalizeGuess('ice-cream ')).toBe('ICE-CREAM');
    expect(normalizeGuess('  ')).toBe('');
    expect(normalizeGuess(null)).toBe('');
  });

  it('correctly validates matching guesses', () => {
    expect(isCorrectGuess('elephant', 'ELEPHANT')).toBe(true);
    expect(isCorrectGuess('  ELEPHANT!  ', 'elephant')).toBe(true);
    expect(isCorrectGuess('cat', 'dog')).toBe(false);
  });

  it('calculates guesser points with time bonus and order bonus', () => {
    // 1st guesser with full 60 seconds: 200 base + 300 time + 100 1st order bonus = 600
    const pointsFull1st = calculateGuesserPoints(60, 60, 0);
    expect(pointsFull1st).toBe(600);

    // 2nd guesser with 30 seconds: 200 base + 150 time + 50 2nd order bonus = 400
    const pointsHalf2nd = calculateGuesserPoints(30, 60, 1);
    expect(pointsHalf2nd).toBe(400);

    // 3rd guesser with 0 seconds: 200 base + 0 time + 0 bonus = 200
    const pointsLastZero = calculateGuesserPoints(0, 60, 2);
    expect(pointsLastZero).toBe(200);
  });

  it('calculates drawer points based on successful guessers', () => {
    expect(calculateDrawerPoints(1)).toBe(75);
    expect(calculateDrawerPoints(3)).toBe(225);
  });

  it('prevents drawers and duplicate guessers from guessing', () => {
    const drawerId = 'user_1';
    const guesser1 = 'user_2';
    const guesser2 = 'user_3';

    // Drawer cannot guess
    expect(canPlayerGuess(drawerId, drawerId, [])).toBe(false);

    // Guesser can guess if not scored yet
    expect(canPlayerGuess(guesser1, drawerId, [])).toBe(true);

    // Guesser cannot guess if already scored in this round
    expect(canPlayerGuess(guesser1, drawerId, [guesser1])).toBe(false);
    expect(canPlayerGuess(guesser2, drawerId, [guesser1])).toBe(true);
  });
});
