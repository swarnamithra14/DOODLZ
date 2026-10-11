/**
 * Curated word library, category management, and hint generators for Doodlz.
 */

export const WORD_BANK = [
  // Easy Words
  { word: 'APPLE', category: 'Food', difficulty: 'easy' },
  { word: 'BANANA', category: 'Food', difficulty: 'easy' },
  { word: 'PIZZA', category: 'Food', difficulty: 'easy' },
  { word: 'BURGER', category: 'Food', difficulty: 'easy' },
  { word: 'COOKIE', category: 'Food', difficulty: 'easy' },
  { word: 'CAT', category: 'Animals', difficulty: 'easy' },
  { word: 'DOG', category: 'Animals', difficulty: 'easy' },
  { word: 'FISH', category: 'Animals', difficulty: 'easy' },
  { word: 'BIRD', category: 'Animals', difficulty: 'easy' },
  { word: 'LION', category: 'Animals', difficulty: 'easy' },
  { word: 'SUN', category: 'Nature', difficulty: 'easy' },
  { word: 'MOON', category: 'Nature', difficulty: 'easy' },
  { word: 'STAR', category: 'Nature', difficulty: 'easy' },
  { word: 'TREE', category: 'Nature', difficulty: 'easy' },
  { word: 'HOUSE', category: 'Objects', difficulty: 'easy' },
  { word: 'CAR', category: 'Objects', difficulty: 'easy' },
  { word: 'BOOK', category: 'Objects', difficulty: 'easy' },
  { word: 'CLOCK', category: 'Objects', difficulty: 'easy' },
  { word: 'GUITAR', category: 'Objects', difficulty: 'easy' },
  { word: 'SMILE', category: 'Actions', difficulty: 'easy' },

  // Medium Words
  { word: 'ELEPHANT', category: 'Animals', difficulty: 'medium' },
  { word: 'GIRAFFE', category: 'Animals', difficulty: 'medium' },
  { word: 'DOLPHIN', category: 'Animals', difficulty: 'medium' },
  { word: 'PENGUIN', category: 'Animals', difficulty: 'medium' },
  { word: 'KANGAROO', category: 'Animals', difficulty: 'medium' },
  { word: 'PENCIL', category: 'Objects', difficulty: 'medium' },
  { word: 'CAMERA', category: 'Objects', difficulty: 'medium' },
  { word: 'ROCKET', category: 'Objects', difficulty: 'medium' },
  { word: 'BICYCLE', category: 'Objects', difficulty: 'medium' },
  { word: 'HELICOPTER', category: 'Objects', difficulty: 'medium' },
  { word: 'VOLCANO', category: 'Nature', difficulty: 'medium' },
  { word: 'RAINBOW', category: 'Nature', difficulty: 'medium' },
  { word: 'WATERFALL', category: 'Nature', difficulty: 'medium' },
  { word: 'CAMPFIRE', category: 'Nature', difficulty: 'medium' },
  { word: 'POPCORN', category: 'Food', difficulty: 'medium' },
  { word: 'PANCAKE', category: 'Food', difficulty: 'medium' },
  { word: 'SANDWICH', category: 'Food', difficulty: 'medium' },
  { word: 'SWIMMING', category: 'Actions', difficulty: 'medium' },
  { word: 'DANCING', category: 'Actions', difficulty: 'medium' },

  // Hard Words
  { word: 'CHAMELEON', category: 'Animals', difficulty: 'hard' },
  { word: 'LIGHTHOUSE', category: 'Objects', difficulty: 'hard' },
  { word: 'SUBMARINE', category: 'Objects', difficulty: 'hard' },
  { word: 'TELESCOPE', category: 'Objects', difficulty: 'hard' },
  { word: 'ASTRONAUT', category: 'People', difficulty: 'hard' },
  { word: 'SCARECROW', category: 'Objects', difficulty: 'hard' },
  { word: 'LABYRINTH', category: 'Places', difficulty: 'hard' },
  { word: 'ROLLERCOASTER', category: 'Places', difficulty: 'hard' },
  { word: 'THUNDERSTORM', category: 'Nature', difficulty: 'hard' },
  { word: 'AVALANCHE', category: 'Nature', difficulty: 'hard' }
];

/**
 * Selects a random word from the bank, avoiding recently used words if possible.
 * @param {string[]} usedWords List of words already used in the current game session
 * @param {string} [difficulty] Optional difficulty filter ('easy' | 'medium' | 'hard')
 * @returns {{ word: string, category: string, difficulty: string }}
 */
export function getRandomWord(usedWords = [], difficulty = null) {
  let pool = WORD_BANK;
  if (difficulty) {
    pool = pool.filter(item => item.difficulty === difficulty);
  }

  const unused = pool.filter(item => !usedWords.includes(item.word));
  const candidatePool = unused.length > 0 ? unused : pool;

  const randomIndex = Math.floor(Math.random() * candidatePool.length);
  return candidatePool[randomIndex];
}

/**
 * Generates an obscured hint for guessers.
 * Letters are replaced with underscores, while spaces and hyphens remain intact.
 * Example: "ICE CREAM" -> "_ _ _   _ _ _ _ _"
 * @param {string} word 
 * @returns {string} Obscured hint representation
 */
export function getWordHint(word) {
  if (!word) return '';
  return word
    .split('')
    .map(char => {
      if (char === ' ') return '  ';
      if (char === '-') return '-';
      return '_';
    })
    .join(' ');
}

/**
 * Returns the character count display.
 * Example: "ELEPHANT" -> "8 letters"
 * @param {string} word 
 * @returns {string}
 */
export function getWordLengthDescription(word) {
  if (!word) return '';
  const clean = word.replace(/[\s-]/g, '');
  return `${clean.length} letter${clean.length === 1 ? '' : 's'}`;
}

/**
 * Calculates Levenshtein edit distance between two strings.
 * Used to detect "Close guess!" feedback (edit distance of 1).
 */
export function getEditDistance(a, b) {
  const s1 = a.toUpperCase();
  const s2 = b.toUpperCase();
  const m = s1.length;
  const n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Checks if a guess is very close to the secret word (1 typo away).
 * @param {string} guess 
 * @param {string} secretWord 
 * @returns {boolean}
 */
export function isCloseGuess(guess, secretWord) {
  if (!guess || !secretWord) return false;
  const g = guess.trim().toUpperCase();
  const s = secretWord.trim().toUpperCase();
  if (g === s) return false; // Exact match, not just close
  if (s.length >= 4 && getEditDistance(g, s) === 1) {
    return true;
  }
  return false;
}
