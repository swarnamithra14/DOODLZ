/**
 * Scoring and guess evaluation engine for Doodlz.
 */

export const ROUND_TIME_SECONDS = 60;
export const BASE_GUESS_POINTS = 200;
export const MAX_TIME_BONUS = 300;
export const FIRST_GUESSER_BONUS = 100;
export const SECOND_GUESSER_BONUS = 50;
export const DRAWER_POINTS_PER_GUESSER = 75;

/**
 * Normalizes a user guess for evaluation.
 * Strips accents, trims whitespace, removes non-alphanumeric punctuation, and converts to uppercase.
 * @param {string} text 
 * @returns {string}
 */
export function normalizeGuess(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, ' ')
    .toUpperCase();
}

/**
 * Checks if a guess matches the secret word.
 * @param {string} guess 
 * @param {string} secretWord 
 * @returns {boolean}
 */
export function isCorrectGuess(guess, secretWord) {
  const normGuess = normalizeGuess(guess);
  const normSecret = normalizeGuess(secretWord);
  if (!normGuess || !normSecret) return false;
  return normGuess === normSecret;
}

/**
 * Calculates points awarded to a guesser.
 * @param {number} timeLeft Remaining seconds on round timer
 * @param {number} totalTime Total round duration in seconds (default 60)
 * @param {number} guessOrder Index of correct guess (0 for 1st, 1 for 2nd, etc.)
 * @returns {number} Points earned
 */
export function calculateGuesserPoints(timeLeft, totalTime = ROUND_TIME_SECONDS, guessOrder = 0) {
  const clampedTime = Math.max(0, Math.min(timeLeft, totalTime));
  const timeBonus = Math.round((clampedTime / totalTime) * MAX_TIME_BONUS);
  
  let orderBonus = 0;
  if (guessOrder === 0) {
    orderBonus = FIRST_GUESSER_BONUS;
  } else if (guessOrder === 1) {
    orderBonus = SECOND_GUESSER_BONUS;
  }

  return BASE_GUESS_POINTS + timeBonus + orderBonus;
}

/**
 * Calculates points awarded to the drawer when a player guesses correctly.
 * @param {number} totalCorrectGuessers Number of guessers who succeeded this round
 * @returns {number} Points earned by drawer
 */
export function calculateDrawerPoints(totalCorrectGuessers = 1) {
  return totalCorrectGuessers * DRAWER_POINTS_PER_GUESSER;
}

/**
 * Checks whether a player is eligible to guess and earn points.
 * Returns false if the player is the drawer or has already guessed correctly.
 * @param {string} playerId 
 * @param {string} currentDrawerId 
 * @param {string[]} correctGuesserIds 
 * @returns {boolean}
 */
export function canPlayerGuess(playerId, currentDrawerId, correctGuesserIds = []) {
  if (!playerId) return false;
  if (playerId === currentDrawerId) return false; // Drawers cannot guess
  if (correctGuesserIds.includes(playerId)) return false; // Already scored this round
  return true;
}
