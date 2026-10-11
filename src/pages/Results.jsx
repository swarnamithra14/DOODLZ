import React from 'react';
import { Trophy, Award, RotateCcw, Home, Crown, Sparkles } from 'lucide-react';

export default function Results({
  players = [],
  currentUser,
  onPlayAgain,
  onReturnHome
}) {
  // Sort players descending by score
  const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
  const winner = sortedPlayers[0];
  const isWinner = winner?.id === currentUser?.id;

  return (
    <div className="animate-pop" style={{ maxWidth: '680px', margin: '0 auto', width: '100%', textAlign: 'center' }}>
      {/* Winner Celebration Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '84px',
            height: '84px',
            backgroundColor: 'var(--color-primary)',
            borderRadius: '50%',
            border: '3px solid var(--color-border)',
            boxShadow: 'var(--shadow-md)',
            marginBottom: '1rem',
            position: 'relative'
          }}
        >
          <Crown size={44} color="#181824" strokeWidth={2.5} />
          <div 
            style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              backgroundColor: '#EF4444',
              borderRadius: '50%',
              padding: '4px'
            }}
          >
            <Sparkles size={16} color="#FFFFFF" />
          </div>
        </div>

        <h2 
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 5vw, 2.75rem)',
            fontWeight: 700,
            marginBottom: '0.25rem'
          }}
        >
          {isWinner ? 'You Won!' : `${winner?.name} Wins!`}
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>
          Final game results and scoreboard
        </p>
      </div>

      {/* Podium Card */}
      <div className="doodle-card" style={{ backgroundColor: '#FFFFFF', padding: '2rem', marginBottom: '1.75rem' }}>
        <h3 
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.35rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <Trophy size={20} color="#F59E0B" />
          <span>Final Standings</span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
          {sortedPlayers.map((player, rank) => {
            const isFirst = rank === 0;
            const isSecond = rank === 1;
            const isThird = rank === 2;
            const isCurrent = player.id === currentUser?.id;

            return (
              <div
                key={player.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isFirst
                    ? '#FEF3C7'
                    : isSecond
                    ? '#F1F5F9'
                    : isThird
                    ? '#FFEDD5'
                    : 'var(--color-bg-alt)',
                  border: isFirst
                    ? '2.5px solid #F59E0B'
                    : isCurrent
                    ? '2.5px solid var(--color-primary)'
                    : '2px solid var(--color-border-subtle)',
                  boxShadow: isFirst ? 'var(--shadow-sm)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  {/* Rank Badge */}
                  <div 
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: isFirst ? '#F59E0B' : '#181824',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: '0.95rem'
                    }}
                  >
                    #{rank + 1}
                  </div>

                  {/* Avatar */}
                  <span style={{ fontSize: '1.75rem' }}>{player.avatar || '🎨'}</span>

                  {/* Name */}
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>
                        {player.name}
                      </span>
                      {isCurrent && (
                        <span className="badge badge-you" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>
                          You
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div style={{ textAlign: 'right' }}>
                  <span 
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.35rem',
                      fontWeight: 700,
                      color: isFirst ? '#B45309' : 'var(--color-text-main)'
                    }}
                  >
                    {player.score || 0}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginLeft: '4px' }}>
                    pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onPlayAgain}
            style={{ fontSize: '1.1rem', padding: '0.85rem 1.75rem' }}
          >
            <RotateCcw size={18} />
            <span>Play Again</span>
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={onReturnHome}
            style={{ fontSize: '1.1rem', padding: '0.85rem 1.75rem' }}
          >
            <Home size={18} />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}
