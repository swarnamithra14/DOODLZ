import React from 'react';
import { Pencil, CheckCircle2, Trophy } from 'lucide-react';

export default function Scoreboard({
  players = [],
  currentDrawerId,
  currentUserId,
  correctGuesserIds = []
}) {
  // Sort players descending by score
  const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div 
      className="doodle-card"
      style={{
        backgroundColor: '#FFFFFF',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minWidth: '220px'
      }}
    >
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
        <Trophy size={18} color="#F59E0B" />
        <span>Scoreboard</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, overflowY: 'auto' }}>
        {sortedPlayers.map((player, rank) => {
          const isDrawer = player.id === currentDrawerId;
          const isCurrentUser = player.id === currentUserId;
          const hasGuessed = correctGuesserIds.includes(player.id);

          return (
            <div
              key={player.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: hasGuessed
                  ? '#ECFDF5'
                  : isDrawer
                  ? '#FFFBEB'
                  : isCurrentUser
                  ? 'var(--color-bg-alt)'
                  : '#FFFFFF',
                border: hasGuessed
                  ? '1.5px solid #10B981'
                  : isDrawer
                  ? '1.5px solid #F59E0B'
                  : '1.5px solid var(--color-border-subtle)',
                transition: 'all var(--transition-fast)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                <span 
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    color: rank === 0 ? '#F59E0B' : 'var(--color-text-muted)',
                    width: '14px',
                    textAlign: 'center'
                  }}
                >
                  #{rank + 1}
                </span>

                <span style={{ fontSize: '1.25rem' }}>{player.avatar || '🎨'}</span>

                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span 
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '90px'
                      }}
                    >
                      {player.name}
                    </span>
                    {isCurrentUser && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-accent-blue)', fontWeight: 700 }}>
                        (You)
                      </span>
                    )}
                  </div>

                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                    {player.score || 0} pts
                  </span>
                </div>
              </div>

              {/* Status Icons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {isDrawer && (
                  <span 
                    title="Drawing right now"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      backgroundColor: '#FEF3C7',
                      color: '#B45309',
                      padding: '0.15rem 0.35rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.7rem',
                      fontWeight: 700
                    }}
                  >
                    <Pencil size={12} /> Drawing
                  </span>
                )}

                {hasGuessed && !isDrawer && (
                  <span 
                    title="Guessed correctly!"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      color: '#10B981',
                      fontWeight: 700,
                      fontSize: '0.75rem'
                    }}
                  >
                    <CheckCircle2 size={16} />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
