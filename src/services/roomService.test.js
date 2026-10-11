import { describe, it, expect, vi } from 'vitest';
import { 
  createRoom, 
  joinRoom, 
  subscribeToRoom, 
  subscribeToPlayers 
} from './roomService.js';

describe('Room Service Module', () => {
  it('rejects invalid names when creating a room', async () => {
    await expect(createRoom({ name: '', avatar: '🎨' })).rejects.toThrow();
    await expect(createRoom({ name: 'A', avatar: '🎨' })).rejects.toThrow();
  });

  it('rejects invalid room codes when joining a room', async () => {
    await expect(joinRoom('', { name: 'Player', avatar: '🎨' })).rejects.toThrow();
    await expect(joinRoom('AB', { name: 'Player', avatar: '🎨' })).rejects.toThrow();
  });

  it('provides safe unsubscribe functions on real-time subscriptions', () => {
    const unsubRoom = subscribeToRoom('DOOD99', () => {});
    expect(typeof unsubRoom).toBe('function');
    expect(() => unsubRoom()).not.toThrow();

    const unsubPlayers = subscribeToPlayers('DOOD99', () => {});
    expect(typeof unsubPlayers).toBe('function');
    expect(() => unsubPlayers()).not.toThrow();
  });
});
