import { describe, it, expect } from 'vitest';
import { 
  sendStroke, 
  subscribeToStrokes, 
  sendChatMessage, 
  subscribeToChatMessages,
  subscribeToSecretWord
} from './gameService.js';

describe('Game Service Realtime Sync', () => {
  it('safely handles sendStroke without throwing in unconfigured or offline mode', async () => {
    await expect(sendStroke('DOOD99', { id: 's1', points: [] })).resolves.not.toThrow();
  });

  it('safely handles sendChatMessage without throwing', async () => {
    await expect(sendChatMessage('DOOD99', { text: 'hello' })).resolves.not.toThrow();
  });

  it('returns clean unsubscribe functions on subscriptions', () => {
    const unsubStrokes = subscribeToStrokes('DOOD99', () => {});
    expect(typeof unsubStrokes).toBe('function');
    expect(() => unsubStrokes()).not.toThrow();

    const unsubChat = subscribeToChatMessages('DOOD99', () => {});
    expect(typeof unsubChat).toBe('function');
    expect(() => unsubChat()).not.toThrow();

    const unsubSecret = subscribeToSecretWord('DOOD99', () => {});
    expect(typeof unsubSecret).toBe('function');
    expect(() => unsubSecret()).not.toThrow();
  });
});
