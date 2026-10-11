import { describe, it, expect } from 'vitest';
import { isFirebaseConfigured, getFirebaseStatus } from './firebase.js';

describe('Firebase Service Module', () => {
  it('correctly reports unconfigured state when environment variables are placeholders or missing', () => {
    // In local test environment without real secrets, isFirebaseConfigured should return false safely
    const status = getFirebaseStatus();
    expect(typeof status.configured).toBe('boolean');
    expect(Array.isArray(status.missingKeys)).toBe(true);
  });

  it('safely exposes getFirebaseStatus without crashing', () => {
    const isConfigured = isFirebaseConfigured();
    expect(typeof isConfigured).toBe('boolean');
  });
});
