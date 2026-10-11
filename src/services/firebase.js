/**
 * Centralized Firebase initialization module for Doodlz.
 * Configured via Vite environment variables (VITE_FIREBASE_*).
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, getDocs, limit, query } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

/**
 * Checks whether valid Firebase environment variables are provided.
 * @returns {boolean} True if all necessary credentials are present
 */
export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== 'your-api-key-here' &&
    firebaseConfig.projectId !== 'your-project-id'
  );
}

/**
 * Diagnostic status helper for UI and tests.
 */
export function getFirebaseStatus() {
  const configured = isFirebaseConfigured();
  return {
    configured,
    projectId: configured ? firebaseConfig.projectId : null,
    hasAuthDomain: Boolean(firebaseConfig.authDomain),
    missingKeys: Object.entries(firebaseConfig)
      .filter(([_, v]) => !v || v.includes('your-'))
      .map(([k]) => k)
  };
}

let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.warn('[Firebase] Initialization error:', error.message);
  }
} else {
  // Graceful development mode fallback
  if (import.meta.env.DEV) {
    console.info(
      '[Firebase] Environment variables not configured or using placeholders. Running in offline/local simulator mode. See FIREBASE_SETUP.md for details.'
    );
  }
}

/**
 * Tests live connection to Firebase Auth & Firestore.
 * Performs an anonymous auth ping and a simple Firestore read.
 * @returns {Promise<{ success: boolean, configured: boolean, message: string, details?: any }>}
 */
export async function testFirebaseConnection() {
  if (!isFirebaseConfigured()) {
    return {
      success: false,
      configured: false,
      message: 'Firebase is not yet configured. Environment variables in .env.local are missing or using placeholders.'
    };
  }

  try {
    // 1. Check anonymous auth
    let userId = auth?.currentUser?.uid;
    if (!userId && auth) {
      const cred = await signInAnonymously(auth);
      userId = cred.user.uid;
    }

    // 2. Perform a test ping against Firestore
    const q = query(collection(db, 'rooms'), limit(1));
    await getDocs(q);

    return {
      success: true,
      configured: true,
      message: `Connected successfully to Firebase project "${firebaseConfig.projectId}"!`,
      details: {
        projectId: firebaseConfig.projectId,
        userId: userId || 'anonymous'
      }
    };
  } catch (error) {
    return {
      success: false,
      configured: true,
      message: `Firebase error: ${error.message}`,
      error
    };
  }
}

export { app, auth, db, firebaseConfig };
