import { describe, it, expect } from 'vitest';
import { getBotStrokesForWord, getBotWrongGuess, BOT_SKETCH_TEMPLATES } from './botAI.js';

describe('Bot AI Engine', () => {
  it('provides structured procedural strokes for known template words', () => {
    const strokes = getBotStrokesForWord('CAMERA', 'Objects');
    expect(strokes.length).toBeGreaterThanOrEqual(3);
    strokes.forEach(s => {
      expect(s.points.length).toBeGreaterThan(0);
      expect(typeof s.color).toBe('string');
      expect(typeof s.size).toBe('number');
    });
  });

  it('generates fallback procedural strokes for any word', () => {
    const strokes = getBotStrokesForWord('UNKNOWN_MYSTERY_WORD', 'Food');
    expect(strokes.length).toBeGreaterThanOrEqual(2);
  });

  it('generates plausible wrong guesses without spoiling the secret word', () => {
    const guess = getBotWrongGuess('CAMERA', 'Objects');
    expect(guess).not.toBe('CAMERA');
    expect(typeof guess).toBe('string');
    expect(guess.length).toBeGreaterThan(0);
  });
});
