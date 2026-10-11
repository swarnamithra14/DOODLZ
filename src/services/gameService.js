/**
 * Real-time Gameplay Synchronization Service for Doodlz.
 * Handles live drawing strokes, chat guesses, secret word security, and scores over Firestore.
 */
import { 
  doc, 
  collection, 
  setDoc, 
  getDoc, 
  addDoc,
  deleteDoc, 
  getDocs,
  updateDoc, 
  onSnapshot, 
  serverTimestamp, 
  query, 
  limit, 
  increment,
  arrayUnion
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase.js';

/**
 * Sends a completed drawing stroke to Firestore.
 * @param {string} roomId 
 * @param {{ id: string, color: string, size: number, isEraser: boolean, points: Array<{x: number, y: number}> }} stroke 
 */
export async function sendStroke(roomId, stroke) {
  if (!isFirebaseConfigured() || !db || !roomId || !stroke) return;

  try {
    const strokeRef = doc(db, 'rooms', roomId, 'strokes', stroke.id);
    await setDoc(strokeRef, {
      ...stroke,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.warn('[gameService] Error sending stroke:', err.message);
  }
}

/**
 * Subscribes to real-time drawing strokes in a room.
 * @param {string} roomId 
 * @param {(strokes: any[]) => void} onUpdate 
 * @returns {() => void} Unsubscribe function
 */
export function subscribeToStrokes(roomId, onUpdate) {
  if (!isFirebaseConfigured() || !db || !roomId) {
    return () => {};
  }

  const strokesColRef = collection(db, 'rooms', roomId, 'strokes');
  const q = query(strokesColRef);

  return onSnapshot(q, (snap) => {
    const strokes = snap.docs.map(doc => doc.data());
    strokes.sort((a, b) => (a.id > b.id ? 1 : -1));
    onUpdate(strokes);
  }, (err) => {
    console.warn('[gameService] Error subscribing to strokes:', err.message);
  });
}

/**
 * Clears all strokes from the canvas for a new turn.
 * @param {string} roomId 
 */
export async function clearStrokesInFirestore(roomId) {
  if (!isFirebaseConfigured() || !db || !roomId) return;

  try {
    const strokesColRef = collection(db, 'rooms', roomId, 'strokes');
    const snap = await getDocs(strokesColRef);
    const deletePromises = snap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletePromises);
  } catch (err) {
    console.warn('[gameService] Error clearing strokes:', err.message);
  }
}

/**
 * Sends a guess or chat message to the room's live feed.
 * @param {string} roomId 
 * @param {{ senderId: string, senderName: string, text: string, type?: string, isSuccess?: boolean }} message 
 */
export async function sendChatMessage(roomId, message) {
  if (!isFirebaseConfigured() || !db || !roomId) return;

  try {
    const chatColRef = collection(db, 'rooms', roomId, 'guesses');
    await addDoc(chatColRef, {
      ...message,
      createdAt: serverTimestamp(),
      clientTimestamp: Date.now()
    });
  } catch (err) {
    console.warn('[gameService] Error sending chat message:', err.message);
  }
}

/**
 * Subscribes to the live chat and guess feed in real time.
 * @param {string} roomId 
 * @param {(messages: any[]) => void} onUpdate 
 * @returns {() => void} Unsubscribe function
 */
export function subscribeToChatMessages(roomId, onUpdate) {
  if (!isFirebaseConfigured() || !db || !roomId) {
    return () => {};
  }

  const chatColRef = collection(db, 'rooms', roomId, 'guesses');
  const q = query(chatColRef, limit(60));

  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map(doc => ({ ...doc.data(), msgDocId: doc.id }));
    messages.sort((a, b) => (a.clientTimestamp || 0) - (b.clientTimestamp || 0));
    onUpdate(messages);
  }, (err) => {
    console.warn('[gameService] Error subscribing to chat:', err.message);
  });
}

/**
 * Host updates turn state in Firestore.
 * Sets drawer, hint, and category publicly on rooms/{roomId},
 * and saves secret word into protected rooms/{roomId}/secret/currentRound.
 * @param {string} roomId 
 * @param {{ drawerId: string, drawerIndex: number, word: string, category: string, hint: string, round: number, timeLeft?: number }} turnData 
 */
export async function setAuthoritativeTurn(roomId, turnData) {
  if (!isFirebaseConfigured() || !db || !roomId) return;

  try {
    // 1. Clear old strokes for the new turn
    await clearStrokesInFirestore(roomId);

    // 2. Save secret word in the protected subcollection (accessible ONLY to drawer & host)
    const secretRef = doc(db, 'rooms', roomId, 'secret', 'currentRound');
    await setDoc(secretRef, {
      word: turnData.word,
      drawerId: turnData.drawerId,
      category: turnData.category,
      updatedAt: serverTimestamp()
    });

    // 3. Update public room state
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      currentDrawerId: turnData.drawerId,
      currentDrawerIndex: turnData.drawerIndex,
      currentCategory: turnData.category,
      currentHint: turnData.hint,
      currentRound: turnData.round,
      timeLeft: turnData.timeLeft || 60,
      isIntermission: false,
      revealedWord: '',
      correctGuesserIds: [],
      turnStartTime: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    console.warn('[gameService] Error setting authoritative turn:', err.message);
  }
}

/**
 * Host updates countdown on Firestore.
 * @param {string} roomId 
 * @param {number} seconds 
 */
export async function updateRoomCountdown(roomId, seconds) {
  if (!isFirebaseConfigured() || !db || !roomId) return;

  try {
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      timeLeft: seconds
    });
  } catch (err) {
    console.warn('[gameService] Error updating countdown:', err.message);
  }
}

/**
 * Host ends active turn and puts room into intermission state.
 * @param {string} roomId 
 * @param {string} word 
 */
export async function setIntermissionInFirestore(roomId, word) {
  if (!isFirebaseConfigured() || !db || !roomId) return;

  try {
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      isIntermission: true,
      revealedWord: word,
      intermissionCountdown: 4,
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    console.warn('[gameService] Error setting intermission:', err.message);
  }
}

/**
 * Host transitions room to final ended status.
 * @param {string} roomId 
 */
export async function endGameInFirestore(roomId) {
  if (!isFirebaseConfigured() || !db || !roomId) return;

  try {
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      status: 'ended',
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    console.warn('[gameService] Error ending game in Firestore:', err.message);
  }
}

/**
 * Adds a player ID to correctGuesserIds in Firestore.
 * @param {string} roomId 
 * @param {string} playerId 
 */
export async function addCorrectGuesserInFirestore(roomId, playerId) {
  if (!isFirebaseConfigured() || !db || !roomId || !playerId) return;

  try {
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      correctGuesserIds: arrayUnion(playerId)
    });
  } catch (err) {
    console.warn('[gameService] Error adding correct guesser:', err.message);
  }
}

/**
 * Drawer or host subscribes to the protected secret word for the current round.
 * @param {string} roomId 
 * @param {(secretData: any) => void} onUpdate 
 * @returns {() => void} Unsubscribe function
 */
export function subscribeToSecretWord(roomId, onUpdate) {
  if (!isFirebaseConfigured() || !db || !roomId) {
    return () => {};
  }

  const secretRef = doc(db, 'rooms', roomId, 'secret', 'currentRound');
  return onSnapshot(secretRef, (snap) => {
    if (snap.exists()) {
      onUpdate(snap.data());
    }
  }, (err) => {
    console.info('[gameService] Secret word restricted by security rules for guesser.');
  });
}

/**
 * Increment player score in Firestore using atomic increments.
 * @param {string} roomId 
 * @param {string} playerId 
 * @param {number} points 
 */
export async function awardPlayerScore(roomId, playerId, points) {
  if (!isFirebaseConfigured() || !db || !roomId || !playerId || points <= 0) return;

  try {
    const playerRef = doc(db, 'rooms', roomId, 'players', playerId);
    await updateDoc(playerRef, {
      score: increment(points)
    });
  } catch (err) {
    console.warn('[gameService] Error awarding score:', err.message);
  }
}
