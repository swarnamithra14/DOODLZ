/**
 * Curated word repository partitioned by difficulty
 */
const WORD_BANK = {
  easy: [
    'CAT', 'SUN', 'TREE', 'BOOK', 'FISH', 'APPLE', 'HOUSE', 'CAR', 'STAR', 'BIRD',
    'MOON', 'BOAT', 'DOOR', 'BALL', 'CAKE', 'HAT', 'SHOE', 'CLOCK', 'SMILE', 'RING'
  ],
  medium: [
    'GUITAR', 'PENGUIN', 'CASTLE', 'ROCKET', 'PIZZA', 'BICYCLE', 'CAMERA', 'DOLPHIN',
    'MONKEY', 'CANDLE', 'WIZARD', 'BRIDGE', 'ISLAND', 'DRAGON', 'VOLCANO', 'SUBMARINE'
  ],
  hard: [
    'ASTRONAUT', 'LIGHTHOUSE', 'CHAMELEON', 'TELESCOPE', 'HOURGLASS', 'SCARECROW',
    'LABYRINTH', 'AVALANCHE', 'METEORITE', 'MICROPHONE', 'CAROUSEL', 'FIREWORKS'
  ]
};

class WordManager {
  getRandomWord(difficulty = 'medium') {
    const pool = WORD_BANK[difficulty] || WORD_BANK.medium;
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  }

  getWordHint(word) {
    if (!word) return '';
    return word.split('').map(char => (char === ' ' ? ' ' : '_')).join(' ');
  }
}

export const wordManager = new WordManager();
export default wordManager;
