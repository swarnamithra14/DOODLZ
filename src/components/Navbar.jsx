import React from 'react';
import { Pencil, HelpCircle } from 'lucide-react';

export default function Navbar({ onOpenHowToPlay }) {
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

      <div>
        <button
          type="button"
          className="btn btn-outline"
          onClick={onOpenHowToPlay}
          aria-label="How to play instructions"
          style={{ padding: '0.55rem 1rem', fontSize: '0.95rem' }}
        >
          <HelpCircle size={18} />
          <span>How to Play</span>
        </button>
      </div>
    </header>
  );
}
