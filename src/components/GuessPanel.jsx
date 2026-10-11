import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Check, Sparkles } from 'lucide-react';

export default function GuessPanel({
  messages = [],
  onSendGuess,
  isDrawer = false,
  hasGuessed = false,
  currentUserId
}) {
  const [guessInput, setGuessInput] = useState('');
  const feedEndRef = useRef(null);

  // Auto-scroll chat feed to newest message
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = guessInput.trim();
    if (!trimmed || isDrawer || hasGuessed) return;
    onSendGuess(trimmed);
    setGuessInput('');
  };

  const isInputDisabled = isDrawer || hasGuessed;

  return (
    <div 
      className="doodle-card"
      style={{
        backgroundColor: '#FFFFFF',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minWidth: '260px'
      }}
    >
      {/* Header */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          paddingBottom: '0.65rem',
          marginBottom: '0.75rem',
          borderBottom: '2px dashed var(--color-border-subtle)',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '1.1rem'
        }}
      >
        <MessageSquare size={18} color="var(--color-accent-blue)" />
        <span>Live Guesses</span>
      </div>

      {/* Messages Feed */}
      <div 
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
          paddingRight: '0.25rem',
          marginBottom: '0.75rem',
          maxHeight: '340px'
        }}
      >
        {messages.length === 0 ? (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--color-text-light)', fontSize: '0.85rem' }}>
            No guesses yet. Be the first to guess!
          </div>
        ) : (
          messages.map((msg, idx) => {
            if (msg.type === 'system') {
              return (
                <div 
                  key={idx}
                  style={{
                    backgroundColor: msg.isSuccess ? '#ECFDF5' : 'var(--color-bg-alt)',
                    color: msg.isSuccess ? '#065F46' : 'var(--color-text-muted)',
                    border: msg.isSuccess ? '1.5px solid #10B981' : '1px solid var(--color-border-subtle)',
                    padding: '0.35rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textAlign: 'center'
                  }}
                >
                  {msg.isSuccess && <Sparkles size={13} style={{ display: 'inline', marginRight: '4px' }} />}
                  {msg.text}
                </div>
              );
            }

            if (msg.type === 'close') {
              return (
                <div 
                  key={idx}
                  style={{
                    backgroundColor: '#FFFBEB',
                    color: '#B45309',
                    border: '1.5px solid #F59E0B',
                    padding: '0.35rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textAlign: 'center'
                  }}
                >
                  {msg.text}
                </div>
              );
            }

            const isOwn = msg.senderId === currentUserId;

            return (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '0.3rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isOwn ? '#EFF6FF' : 'var(--color-bg-alt)',
                  border: isOwn ? '1px solid #BFDBFE' : '1px solid transparent',
                  fontSize: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>
                    {msg.senderName}:
                  </span>
                  <span style={{ color: 'var(--color-text-main)' }}>
                    {msg.text}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={feedEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.4rem' }}>
        <input
          type="text"
          className="doodle-input"
          placeholder={
            isDrawer
              ? 'You are drawing!'
              : hasGuessed
              ? 'You already guessed it!'
              : 'Type your guess...'
          }
          value={guessInput}
          onChange={(e) => setGuessInput(e.target.value)}
          disabled={isInputDisabled}
          style={{
            fontSize: '0.9rem',
            padding: '0.55rem 0.75rem',
            backgroundColor: isInputDisabled ? 'var(--color-bg-alt)' : '#FFFFFF'
          }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isInputDisabled || !guessInput.trim()}
          style={{ padding: '0.55rem 0.85rem' }}
          aria-label="Submit guess"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
