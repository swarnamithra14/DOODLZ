import React from 'react';
import { Pencil, HelpCircle, Database } from 'lucide-react';
import { isFirebaseConfigured } from '../services/firebase.js';

export default function Navbar({ onOpenHowToPlay, onOpenBackendStatus }) {
  const isLive = isFirebaseConfigured();

  return (
    <header className="app-header">
      <div className="brand-logo">
        <div className="brand-icon-box" aria-hidden="true">
          <Pencil size={24} strokeWidth={2.5} color="#181824" />
        </div>
        <div>
          <h1 className="brand-title">Doodlz</h1>
          <p className="brand-tagline">Draw it. Guess it. Win it.</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        {/* Backend Connection Indicator Badge */}
        <button
          type="button"
          onClick={onOpenBackendStatus}
          aria-label="Backend status"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            border: isLive ? '1.5px solid #10B981' : '1.5px solid #F59E0B',
            backgroundColor: isLive ? '#ECFDF5' : '#FFFBEB',
            color: isLive ? '#065F46' : '#B45309',
            fontFamily: 'var(--font-display)',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all var(--transition-fast)'
          }}
          title="Click to check backend status & connection"
        >
          <Database size={15} />
          <span>{isLive ? 'Firebase Live' : 'Local Mode'}</span>
        </button>

        {/* How to Play Button */}
        <button
          type="button"
          className="btn btn-outline"
          onClick={onOpenHowToPlay}
          aria-label="How to play instructions"
          style={{ padding: '0.5rem 0.95rem', fontSize: '0.9rem' }}
        >
          <HelpCircle size={18} />
          <span>How to Play</span>
        </button>
      </div>
    </header>
  );
}
