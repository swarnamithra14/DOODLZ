import React, { useEffect } from 'react';
import { X, Palette, MessageSquare, Award, Clock } from 'lucide-react';

export default function HowToPlayModal({ isOpen, onClose }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const rules = [
    {
      icon: <Palette size={24} color="#FF5376" />,
      title: '1. One Draws',
      desc: 'Each turn, one player is given a secret word and draws it on the canvas before the timer runs out.'
    },
    {
      icon: <MessageSquare size={24} color="#3B82F6" />,
      title: '2. Others Guess',
      desc: 'Guessers type words into the chat feed. Letters are hidden until you guess correctly!'
    },
    {
      icon: <Clock size={24} color="#F59E0B" />,
      title: '3. Speed Counts',
      desc: 'The faster you guess the word correctly, the more bonus points you and the drawer earn.'
    },
    {
      icon: <Award size={24} color="#10B981" />,
      title: '4. Crown the Winner',
      desc: 'Rounds rotate until everyone has drawn. The player with the highest total score wins!'
    }
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(24, 24, 36, 0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        className="doodle-card animate-pop"
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#FFFFFF',
          padding: '2rem'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 id="modal-title" style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700 }}>
            How to Play Doodlz
          </h2>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            aria-label="Close instructions"
            style={{ padding: '0.4rem' }}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
          {rules.map((rule, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: 'var(--color-bg-alt)',
                border: '2px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
                {rule.icon}
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600 }}>
                  {rule.title}
                </h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                {rule.desc}
              </p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onClose}
            style={{ minWidth: '120px' }}
          >
            Got it, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
}
