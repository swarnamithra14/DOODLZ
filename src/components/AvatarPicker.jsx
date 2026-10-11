import React from 'react';
import { AVATAR_OPTIONS } from '../utils/roomCode.js';

export default function AvatarPicker({ selectedAvatar, onSelectAvatar }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label 
        style={{ 
          display: 'block', 
          fontFamily: 'var(--font-display)', 
          fontWeight: 600, 
          marginBottom: '0.5rem',
          fontSize: '1rem',
          color: 'var(--color-text-main)'
        }}
      >
        Choose Your Avatar
      </label>
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(44px, 1fr))',
          gap: '0.5rem',
          backgroundColor: 'var(--color-bg-alt)',
          padding: '0.75rem',
          borderRadius: 'var(--radius-md)',
          border: '2px solid var(--color-border-subtle)'
        }}
        role="radiogroup"
        aria-label="Avatar options"
      >
        {AVATAR_OPTIONS.map((avatar) => {
          const isSelected = selectedAvatar === avatar;
          return (
            <button
              key={avatar}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectAvatar(avatar)}
              style={{
                fontSize: '1.5rem',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-sm)',
                border: isSelected ? '2.5px solid var(--color-border)' : '2px solid transparent',
                backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              {avatar}
            </button>
          );
        })}
      </div>
    </div>
  );
}
