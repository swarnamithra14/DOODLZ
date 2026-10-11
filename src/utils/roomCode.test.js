import { describe, it, expect } from 'vitest';
import {
  generateRoomCode,
  normalizeRoomCode,
  validateRoomCode,
  validatePlayerName,
  AVATAR_OPTIONS
} from './roomCode.js';

describe('Room Code & Player Utilities', () => {
  it('generates a valid 6-character room code format', () => {
    const code = generateRoomCode();
    expect(code).toHaveLength(6);
    expect(validateRoomCode(code).valid).toBe(true);
  });

  it('normalizes codes by removing whitespace and hyphens and uppercasing', () => {
    expect(normalizeRoomCode(' dood-42 ')).toBe('DOOD42');
    expect(normalizeRoomCode('ab 12 - xy')).toBe('AB12XY');
    expect(normalizeRoomCode('')).toBe('');
    expect(normalizeRoomCode(null)).toBe('');
  });

  it('validates room code lengths and characters', () => {
    expect(validateRoomCode('').valid).toBe(false);
    expect(validateRoomCode('AB').valid).toBe(false);
    expect(validateRoomCode('TOOLONGOVER8').valid).toBe(false);
    expect(validateRoomCode('DOOD!#').valid).toBe(false);
    expect(validateRoomCode('DOOD42').valid).toBe(true);
  });

  it('validates player names', () => {
    expect(validatePlayerName('').valid).toBe(false);
    expect(validatePlayerName(' ').valid).toBe(false);
    expect(validatePlayerName('A').valid).toBe(false);
    expect(validatePlayerName('A very very very long nickname').valid).toBe(false);
    
    const valid = validatePlayerName('  Picasso  ');
    expect(valid.valid).toBe(true);
    expect(valid.sanitizedName).toBe('Picasso');
  });

  it('provides a rich set of avatars', () => {
    expect(AVATAR_OPTIONS.length).toBeGreaterThanOrEqual(10);
  });
});
