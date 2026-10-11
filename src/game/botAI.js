/**
 * Bot AI Engine for Doodlz:
 * - Generates progressive drawing strokes when a bot is the drawer
 * - Generates realistic, contextual guesses when bots are guessers
 */

/**
 * Procedural doodle templates for words in the bank.
 * Scaled for the 800x560 canvas.
 */
export const BOT_SKETCH_TEMPLATES = {
  CAMERA: [
    // Body rectangle
    { color: '#181824', size: 9, isEraser: false, points: [{ x: 260, y: 220 }, { x: 540, y: 220 }, { x: 540, y: 400 }, { x: 260, y: 400 }, { x: 260, y: 220 }] },
    // Flash / top prism
    { color: '#181824', size: 8, isEraser: false, points: [{ x: 360, y: 220 }, { x: 380, y: 160 }, { x: 420, y: 160 }, { x: 440, y: 220 }] },
    // Lens outer circle
    { color: '#3B82F6', size: 9, isEraser: false, points: generateCirclePoints(400, 310, 65) },
    // Lens inner circle
    { color: '#181824', size: 6, isEraser: false, points: generateCirclePoints(400, 310, 35) },
    // Shutter button & strap
    { color: '#EF4444', size: 8, isEraser: false, points: [{ x: 280, y: 220 }, { x: 280, y: 190 }, { x: 320, y: 190 }, { x: 320, y: 220 }] },
    { color: '#F59E0B', size: 6, isEraser: false, points: [{ x: 260, y: 300 }, { x: 180, y: 350 }, { x: 200, y: 440 }, { x: 600, y: 440 }, { x: 620, y: 350 }, { x: 540, y: 300 }] }
  ],
  HOUSE: [
    // Walls
    { color: '#181824', size: 9, isEraser: false, points: [{ x: 280, y: 260 }, { x: 520, y: 260 }, { x: 520, y: 440 }, { x: 280, y: 440 }, { x: 280, y: 260 }] },
    // Roof triangle
    { color: '#EF4444', size: 9, isEraser: false, points: [{ x: 260, y: 260 }, { x: 400, y: 140 }, { x: 540, y: 260 }] },
    // Door
    { color: '#78350F', size: 8, isEraser: false, points: [{ x: 370, y: 440 }, { x: 370, y: 340 }, { x: 430, y: 340 }, { x: 430, y: 440 }] },
    // Window
    { color: '#3B82F6', size: 6, isEraser: false, points: [{ x: 450, y: 290 }, { x: 490, y: 290 }, { x: 490, y: 330 }, { x: 450, y: 330 }, { x: 450, y: 290 }] },
    // Chimney
    { color: '#181824', size: 6, isEraser: false, points: [{ x: 470, y: 200 }, { x: 470, y: 160 }, { x: 500, y: 160 }, { x: 500, y: 225 }] }
  ],
  APPLE: [
    // Apple outline
    { color: '#EF4444', size: 10, isEraser: false, points: generateAppleOutline() },
    // Stem
    { color: '#78350F', size: 8, isEraser: false, points: [{ x: 400, y: 180 }, { x: 395, y: 140 }, { x: 410, y: 120 }] },
    // Leaf
    { color: '#10B981', size: 8, isEraser: false, points: [{ x: 405, y: 145 }, { x: 450, y: 130 }, { x: 460, y: 145 }, { x: 415, y: 155 }] }
  ],
  SUN: [
    // Sun center circle
    { color: '#F59E0B', size: 12, isEraser: false, points: generateCirclePoints(400, 280, 70) },
    // Rays
    { color: '#F59E0B', size: 8, isEraser: false, points: [{ x: 400, y: 180 }, { x: 400, y: 120 }] },
    { color: '#F59E0B', size: 8, isEraser: false, points: [{ x: 400, y: 380 }, { x: 400, y: 440 }] },
    { color: '#F59E0B', size: 8, isEraser: false, points: [{ x: 300, y: 280 }, { x: 240, y: 280 }] },
    { color: '#F59E0B', size: 8, isEraser: false, points: [{ x: 500, y: 280 }, { x: 560, y: 280 }] },
    { color: '#F59E0B', size: 8, isEraser: false, points: [{ x: 330, y: 210 }, { x: 280, y: 160 }] },
    { color: '#F59E0B', size: 8, isEraser: false, points: [{ x: 470, y: 350 }, { x: 520, y: 400 }] },
    { color: '#F59E0B', size: 8, isEraser: false, points: [{ x: 470, y: 210 }, { x: 520, y: 160 }] },
    { color: '#F59E0B', size: 8, isEraser: false, points: [{ x: 330, y: 350 }, { x: 280, y: 400 }] }
  ],
  CAR: [
    // Bottom chassis
    { color: '#3B82F6', size: 9, isEraser: false, points: [{ x: 220, y: 340 }, { x: 580, y: 340 }, { x: 580, y: 380 }, { x: 220, y: 380 }, { x: 220, y: 340 }] },
    // Cabin roof
    { color: '#3B82F6', size: 9, isEraser: false, points: [{ x: 280, y: 340 }, { x: 340, y: 260 }, { x: 480, y: 260 }, { x: 530, y: 340 }] },
    // Windows
    { color: '#181824', size: 5, isEraser: false, points: [{ x: 345, y: 270 }, { x: 405, y: 270 }, { x: 405, y: 335 }, { x: 300, y: 335 }, { x: 345, y: 270 }] },
    { color: '#181824', size: 5, isEraser: false, points: [{ x: 415, y: 270 }, { x: 475, y: 270 }, { x: 515, y: 335 }, { x: 415, y: 335 }, { x: 415, y: 270 }] },
    // Wheels
    { color: '#181824', size: 10, isEraser: false, points: generateCirclePoints(290, 385, 26) },
    { color: '#181824', size: 10, isEraser: false, points: generateCirclePoints(510, 385, 26) }
  ],
  ROCKET: [
    // Body fuselage
    { color: '#EF4444', size: 9, isEraser: false, points: [{ x: 370, y: 380 }, { x: 370, y: 240 }, { x: 400, y: 150 }, { x: 430, y: 240 }, { x: 430, y: 380 }, { x: 370, y: 380 }] },
    // Window
    { color: '#3B82F6', size: 7, isEraser: false, points: generateCirclePoints(400, 270, 20) },
    // Left Fin
    { color: '#F59E0B', size: 8, isEraser: false, points: [{ x: 370, y: 320 }, { x: 320, y: 390 }, { x: 370, y: 380 }] },
    // Right Fin
    { color: '#F59E0B', size: 8, isEraser: false, points: [{ x: 430, y: 320 }, { x: 480, y: 390 }, { x: 430, y: 380 }] },
    // Flame
    { color: '#F97316', size: 8, isEraser: false, points: [{ x: 385, y: 385 }, { x: 400, y: 440 }, { x: 415, y: 385 }] }
  ]
};

// Helper: generate points along a circle
function generateCirclePoints(cx, cy, r, numPoints = 20) {
  const pts = [];
  for (let i = 0; i <= numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    pts.push({
      x: Math.round(cx + Math.cos(angle) * r),
      y: Math.round(cy + Math.sin(angle) * r)
    });
  }
  return pts;
}

// Helper: apple curved outline
function generateAppleOutline() {
  const pts = [];
  const cx = 400;
  const cy = 290;
  for (let i = 0; i <= 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    const r = 90 - 12 * Math.cos(angle * 2); // Apple indentation
    pts.push({
      x: Math.round(cx + Math.sin(angle) * r),
      y: Math.round(cy - Math.cos(angle) * (r * 0.95))
    });
  }
  return pts;
}

/**
 * Generates procedural doodle strokes for any word.
 * If word is in templates, returns that rich sketch.
 * Otherwise creates a dynamic cartoon illustration based on category.
 * @param {string} word 
 * @param {string} category 
 * @returns {Array} Array of stroke objects
 */
export function getBotStrokesForWord(word, category = 'Objects') {
  const upper = (word || '').toUpperCase().trim();
  if (BOT_SKETCH_TEMPLATES[upper]) {
    return BOT_SKETCH_TEMPLATES[upper].map(s => ({
      ...s,
      id: 'bot_s_' + Math.random().toString(36).substring(2, 8)
    }));
  }

  // Generic procedural doodle based on category
  const baseColor = category === 'Animals' ? '#78350F' : category === 'Food' ? '#EF4444' : category === 'Nature' ? '#10B981' : '#3B82F6';
  
  return [
    // Main shape
    {
      id: 'bot_s_1',
      color: baseColor,
      size: 9,
      isEraser: false,
      points: [
        { x: 300, y: 220 },
        { x: 500, y: 220 },
        { x: 520, y: 380 },
        { x: 280, y: 380 },
        { x: 300, y: 220 }
      ]
    },
    // Feature 1
    {
      id: 'bot_s_2',
      color: '#181824',
      size: 7,
      isEraser: false,
      points: generateCirclePoints(360, 280, 24)
    },
    // Feature 2
    {
      id: 'bot_s_3',
      color: '#181824',
      size: 7,
      isEraser: false,
      points: generateCirclePoints(440, 280, 24)
    },
    // Highlight
    {
      id: 'bot_s_4',
      color: '#F59E0B',
      size: 8,
      isEraser: false,
      points: [
        { x: 340, y: 340 },
        { x: 400, y: 360 },
        { x: 460, y: 340 }
      ]
    }
  ];
}

/**
 * Plausible bot guesses based on category and word length.
 */
const BOT_GUESS_VOCABULARY = {
  Food: ['PIZZA', 'BURGER', 'APPLE', 'CAKE', 'SANDWICH', 'BREAD', 'DONUT', 'COOKIE', 'SOUP'],
  Animals: ['CAT', 'DOG', 'HORSE', 'BIRD', 'ELEPHANT', 'TIGER', 'MONKEY', 'RABBIT', 'BEAR'],
  Objects: ['BOX', 'CAMERA', 'CAR', 'CLOCK', 'PHONE', 'CHAIR', 'TABLE', 'LAMP', 'BOOK'],
  Nature: ['SUN', 'TREE', 'CLOUD', 'MOUNTAIN', 'RIVER', 'FLOWER', 'STAR', 'FIRE'],
  Actions: ['RUNNING', 'DANCING', 'SLEEPING', 'JUMPING', 'SWIMMING', 'EATING']
};

/**
 * Generates an interesting wrong guess for a bot.
 * @param {string} secretWord 
 * @param {string} category 
 * @returns {string} A wrong guess word
 */
export function getBotWrongGuess(secretWord, category = 'Objects') {
  const pool = BOT_GUESS_VOCABULARY[category] || BOT_GUESS_VOCABULARY.Objects;
  const filtered = pool.filter(w => w !== secretWord?.toUpperCase());
  if (filtered.length === 0) return 'SOMETHING';
  return filtered[Math.floor(Math.random() * filtered.length)];
}
