import { describe, it, expect } from 'vitest';
import {
  getRandomWord,
  getWordHint,
  getWordLengthDescription,
  getEditDistance,
  isCloseGuess,
  WORD_BANK
} from './wordUtils.js';

describe('Word Utilities Engine', () => {
  it('selects a valid random word from the bank', () => {
    const item = getRandomWord();
    expect(item).toBeDefined();
    expect(typeof item.word).toBe('string');
    expect(typeof item.category).toBe('string');
    expect(['easy', 'medium', 'hard']).toContain(item.difficulty);
  });

  it('filters by difficulty if requested', () => {
    const item = getRandomWord([], 'hard');
    expect(item.difficulty).toBe('hard');
  });

  it('generates an obscured hint without revealing letters', () => {
    const hint = getWordHint('CAT');
    expect(hint).toBe('_ _ _');

    const multiWordHint = getWordHint('ICE CREAM');
    expect(multiWordHint).toContain('_');
    expect(multiWordHint).not.toContain('I');
    expect(multiWordHint).not.toContain('C');
  });

  it('returns formatted word length description', () => {
    expect(getWordLengthDescription('PENCIL')).toBe('6 letters');
    expect(getWordLengthDescription('A')).toBe('1 letter');
  });

  it('calculates edit distance correctly', () => {
    expect(getEditDistance('CAT', 'CAT')).toBe(0);
    expect(getEditDistance('CAT', 'BAT')).toBe(1);
    expect(getEditDistance('CAT', 'DOG')).toBe(3);
  });

  it('detects close guesses (1 edit away, not exact)', () => {
    expect(isCloseGuess('ELEPHAN', 'ELEPHANT')).toBe(true);
    expect(isCloseGuess('ELEPHANTT', 'ELEPHANT')).toBe(true);
    expect(isCloseGuess('ELEPHANT', 'ELEPHANT')).toBe(false); // Exact match
    expect(isCloseGuess('APPLE', 'ELEPHANT')).toBe(false); // Far away
  });
});
