/**
 * Utility functions for room code generation, normalization, and validation.
 */

// Fun doodle prefix words to create memorable room codes like "DOOD42" or "DRAW88"
const CODE_PREFIXES = ['DOOD', 'DRAW', 'SKET', 'PENC', 'BRSH', 'INKY', 'TOON', 'BLOT'];

// Fun avatar list for player selection
export const AVATAR_OPTIONS = [
  '🎨', '✏️', '🚀', '🦊', '🐼', '🍕',
  '⚡', '🌟', '🐱', '🎮', '🦄', '🍩',
  '🐶', '🐙', '🥑', '🎯'
];

/**
 * Generates a clean, friendly 6-character room code.
 * Example: "DOOD74", "DRAW19"
 * @returns {string} Room code
 */
export function generateRoomCode() {
  const prefix = CODE_PREFIXES[Math.floor(Math.random() * CODE_PREFIXES.length)];
  const num = Math.floor(10 + Math.random() * 90); // 2-digit number (10-99)
  return `${prefix}${num}`;
}

/**
 * Normalizes a user-entered room code.
 * Strips whitespace, hyphens, and converts to uppercase.
 * @param {string} code 
 * @returns {string} Normalized code
 */
export function normalizeRoomCode(code) {
  if (!code || typeof code !== 'string') return '';
  return code.trim().replace(/[-\s]/g, '').toUpperCase();
}

/**
 * Validates whether a room code is well-formed.
 * Accepts alphanumeric codes between 4 and 8 characters.
 * @param {string} code 
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateRoomCode(code) {
  const normalized = normalizeRoomCode(code);
  if (!normalized) {
    return { valid: false, error: 'Please enter a room code.' };
  }
  if (normalized.length < 4 || normalized.length > 8) {
    return { valid: false, error: 'Room codes must be between 4 and 8 characters.' };
  }
  if (!/^[A-Z0-9]+$/.test(normalized)) {
    return { valid: false, error: 'Room code may only contain letters and numbers.' };
  }
  return { valid: true };
}

/**
 * Normalizes and validates a player display name.
 * @param {string} name 
 * @returns {{ valid: boolean, error?: string, sanitizedName?: string }}
 */
export function validatePlayerName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Please choose a display name.' };
  }
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters long.' };
  }
  if (trimmed.length > 15) {
    return { valid: false, error: 'Name cannot exceed 15 characters.' };
  }
  return { valid: true, sanitizedName: trimmed };
}
