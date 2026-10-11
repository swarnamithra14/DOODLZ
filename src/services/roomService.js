/**
 * Room Management Service for Doodlz.
 * Handles room creation, joining, real-time listeners, and player rosters.
 */
import { 
  doc, 
  collection, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp, 
  query 
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { db, auth, isFirebaseConfigured } from './firebase.js';
import { generateRoomCode, normalizeRoomCode, validateRoomCode, validatePlayerName } from '../utils/roomCode.js';

/**
 * Ensures the client has an active Firebase Authentication session (anonymous).
 * @returns {Promise<import('firebase/auth').User>}
 */
export async function ensureAuthUser() {
  if (!isFirebaseConfigured() || !auth) {
    return { uid: 'local_user_' + Math.random().toString(36).substring(2, 9) };
  }

  if (auth.currentUser) {
    return auth.currentUser;
  }

  const cred = await signInAnonymously(auth);
  return cred.user;
}

/**
 * Creates a new multiplayer room in Firestore.
 * @param {{ name: string, avatar: string }} hostProfile 
 * @returns {Promise<{ roomId: string, roomCode: string, currentUser: any }>}
 */
export async function createRoom(hostProfile) {
  const nameValidation = validatePlayerName(hostProfile.name);
  if (!nameValidation.valid) {
    throw new Error(nameValidation.error);
  }

  const roomCode = generateRoomCode();
  const authUser = await ensureAuthUser();

  if (!isFirebaseConfigured() || !db) {
    // Local fallback
    const user = {
      id: authUser.uid,
      name: nameValidation.sanitizedName,
      avatar: hostProfile.avatar || '🎨',
      isHost: true,
      score: 0
    };
    return {
      roomId: roomCode,
      roomCode,
      currentUser: user,
      isLocal: true
    };
  }

  const roomRef = doc(db, 'rooms', roomCode);
  const playerRef = doc(db, 'rooms', roomCode, 'players', authUser.uid);

  // Write Room Document
  await setDoc(roomRef, {
    code: roomCode,
    hostId: authUser.uid,
    status: 'waiting', // 'waiting' | 'playing' | 'ended'
    currentRound: 1,
    totalRounds: 3,
    currentDrawerId: authUser.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  // Write Host into Players subcollection
  await setDoc(playerRef, {
    id: authUser.uid,
    name: nameValidation.sanitizedName,
    avatar: hostProfile.avatar || '🎨',
    isHost: true,
    score: 0,
    joinedAt: serverTimestamp()
  });

  const currentUser = {
    id: authUser.uid,
    name: nameValidation.sanitizedName,
    avatar: hostProfile.avatar || '🎨',
    isHost: true,
    score: 0
  };

  return {
    roomId: roomCode,
    roomCode,
    currentUser,
    isLocal: false
  };
}

/**
 * Joins an existing room using a 6-character room code.
 * @param {string} rawRoomCode 
 * @param {{ name: string, avatar: string }} userProfile 
 * @returns {Promise<{ roomId: string, roomCode: string, currentUser: any }>}
 */
export async function joinRoom(rawRoomCode, userProfile) {
  const codeValidation = validateRoomCode(rawRoomCode);
  if (!codeValidation.valid) {
    throw new Error(codeValidation.error);
  }

  const nameValidation = validatePlayerName(userProfile.name);
  if (!nameValidation.valid) {
    throw new Error(nameValidation.error);
  }

  const roomCode = normalizeRoomCode(rawRoomCode);
  const authUser = await ensureAuthUser();

  if (!isFirebaseConfigured() || !db) {
    // Local fallback
    const user = {
      id: authUser.uid,
      name: nameValidation.sanitizedName,
      avatar: userProfile.avatar || '🎨',
      isHost: false,
      score: 0
    };
    return {
      roomId: roomCode,
      roomCode,
      currentUser: user,
      isLocal: true
    };
  }

  const roomRef = doc(db, 'rooms', roomCode);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    throw new Error('Room not found. Please double-check your room code.');
  }

  const roomData = roomSnap.data();
  if (roomData.status !== 'waiting') {
    throw new Error('This game has already started.');
  }

  // Check players subcollection capacity and duplicate names
  const playersColRef = collection(db, 'rooms', roomCode, 'players');
  const playersSnap = await getDocs(playersColRef);

  if (playersSnap.size >= 8) {
    throw new Error('This room is full (maximum 8 players).');
  }

  const duplicate = playersSnap.docs.some(
    d => d.data().name?.toLowerCase() === nameValidation.sanitizedName.toLowerCase() && d.id !== authUser.uid
  );
  if (duplicate) {
    throw new Error('That nickname is already taken in this room. Please choose another.');
  }

  const playerRef = doc(db, 'rooms', roomCode, 'players', authUser.uid);
  const isHost = roomData.hostId === authUser.uid;

  await setDoc(playerRef, {
    id: authUser.uid,
    name: nameValidation.sanitizedName,
    avatar: userProfile.avatar || '🎨',
    isHost,
    score: 0,
    joinedAt: serverTimestamp()
  });

  const currentUser = {
    id: authUser.uid,
    name: nameValidation.sanitizedName,
    avatar: userProfile.avatar || '🎨',
    isHost,
    score: 0
  };

  return {
    roomId: roomCode,
    roomCode,
    currentUser,
    isLocal: false
  };
}

/**
 * Subscribes to real-time room status updates.
 * @param {string} roomId 
 * @param {(roomData: any) => void} onUpdate 
 * @param {(err: Error) => void} [onError] 
 * @returns {() => void} Unsubscribe function
 */
export function subscribeToRoom(roomId, onUpdate, onError) {
  if (!isFirebaseConfigured() || !db || !roomId) {
    return () => {};
  }

  const roomRef = doc(db, 'rooms', roomId);
  return onSnapshot(roomRef, (snap) => {
    if (snap.exists()) {
      onUpdate(snap.data());
    } else {
      if (onError) onError(new Error('Room was deleted.'));
    }
  }, (err) => {
    if (onError) onError(err);
  });
}

/**
 * Subscribes to real-time player list changes in a room.
 * @param {string} roomId 
 * @param {(players: any[]) => void} onUpdate 
 * @param {(err: Error) => void} [onError] 
 * @returns {() => void} Unsubscribe function
 */
export function subscribeToPlayers(roomId, onUpdate, onError) {
  if (!isFirebaseConfigured() || !db || !roomId) {
    return () => {};
  }

  const playersColRef = collection(db, 'rooms', roomId, 'players');
  return onSnapshot(playersColRef, (snap) => {
    const list = snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    onUpdate(list);
  }, (err) => {
    if (onError) onError(err);
  });
}

/**
 * Leaves a room and cleans up player document in Firestore.
 * @param {string} roomId 
 * @param {string} userId 
 */
export async function leaveRoom(roomId, userId) {
  if (!isFirebaseConfigured() || !db || !roomId || !userId) {
    return;
  }

  try {
    const playerRef = doc(db, 'rooms', roomId, 'players', userId);
    await deleteDoc(playerRef);

    // Check if room has remaining players
    const playersSnap = await getDocs(collection(db, 'rooms', roomId, 'players'));
    if (playersSnap.empty) {
      // Clean up empty room
      await deleteDoc(doc(db, 'rooms', roomId));
    } else {
      // If host left, reassign host to the oldest remaining player
      const roomSnap = await getDoc(doc(db, 'rooms', roomId));
      if (roomSnap.exists() && roomSnap.data().hostId === userId) {
        const nextHost = playersSnap.docs[0];
        await updateDoc(doc(db, 'rooms', roomId), {
          hostId: nextHost.id,
          updatedAt: serverTimestamp()
        });
        await updateDoc(doc(db, 'rooms', roomId, 'players', nextHost.id), {
          isHost: true
        });
      }
    }
  } catch (err) {
    console.warn('[roomService] Error leaving room:', err.message);
  }
}

/**
 * Host action to transition a room from 'waiting' to 'playing'.
 * @param {string} roomId 
 */
export async function startRoomGame(roomId) {
  if (!isFirebaseConfigured() || !db || !roomId) {
    return;
  }

  const roomRef = doc(db, 'rooms', roomId);
  await updateDoc(roomRef, {
    status: 'playing',
    updatedAt: serverTimestamp()
  });
}
