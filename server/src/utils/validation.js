/**
 * Input sanitization and validation helpers
 */
export function sanitizeString(input, maxLength = 50) {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
}

export function isValidRoomCode(code) {
  if (typeof code !== 'string') return false;
  return /^[A-Za-z0-9]{4,8}$/.test(code.trim());
}

export function isValidPlayerName(name) {
  if (typeof name !== 'string') return false;
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 20;
}
