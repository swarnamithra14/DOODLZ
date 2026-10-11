import React, { useState } from 'react';
import { Copy, Check, Users, Crown, Play, LogOut, UserPlus, AlertCircle } from 'lucide-react';

export default function Lobby({
  roomCode,
  currentUser,
  players = [],
  isHost = false,
  onStartGame,
  onLeaveRoom,
  onSimulateJoin
}) {
  const [copied, setCopied] = useState(false);
  const minPlayersRequired = 2;
  const canStart = isHost && players.length >= minPlayersRequired;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <div className="animate-pop" style={{ maxWidth: '780px', margin: '0 auto', width: '100%' }}>
      {/* Top Bar with Room Code & Actions */}
      <div 
        className="doodle-card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem',
          backgroundColor: '#FFFFFF',
          padding: '1.25rem 1.75rem'
        }}
      >
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Room Code
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.2rem' }}>
            <span 
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2rem',
                fontWeight: 700,
                color: 'var(--color-text-main)',
                letterSpacing: '3px'
              }}
            >
              {roomCode}
            </span>
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleCopyCode}
              aria-label="Copy room code"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.9rem' }}
            >
              {copied ? (
                <>
                  <Check size={16} color="#10B981" />
                  <span style={{ color: '#10B981' }}>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-outline"
          onClick={onLeaveRoom}
          style={{ color: '#EF4444' }}
        >
          <LogOut size={18} />
          <span>Leave Room</span>
        </button>
      </div>

      {/* Main Players Grid Section */}
      <div className="doodle-card" style={{ backgroundColor: '#FFFFFF', padding: '1.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Users size={22} color="var(--color-accent-blue)" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 700 }}>
              Players in Lobby
            </h3>
            <span className="badge badge-ready" style={{ fontSize: '0.8rem' }}>
              {players.length} / 8
            </span>
          </div>

          {/* Dev/Local Simulator Helper */}
          {onSimulateJoin && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onSimulateJoin}
              style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem', color: 'var(--color-accent-blue)' }}
              title="Test lobby with a simulated mock player"
            >
              <UserPlus size={16} />
              <span>+ Add Bot Player (Test)</span>
            </button>
          )}
        </div>

        {/* Players List Grid */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.75rem'
          }}
        >
          {players.map((player) => {
            const isPlayerHost = player.isHost;
            const isCurrent = player.id === currentUser?.id;

            return (
              <div
                key={player.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isCurrent ? '#FFFBEB' : 'var(--color-bg-alt)',
                  border: isCurrent ? '2.5px solid var(--color-primary)' : '2px solid var(--color-border-subtle)',
                  boxShadow: isCurrent ? 'var(--shadow-sm)' : 'none',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div 
                  style={{
                    fontSize: '1.8rem',
                    width: '46px',
                    height: '46px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--color-border-subtle)'
                  }}
                >
                  {player.avatar || '🎨'}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span 
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: '1.05rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {player.name}
                    </span>
                    {isPlayerHost && (
                      <Crown size={16} color="#F59E0B" fill="#F59E0B" aria-label="Host" />
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.2rem' }}>
                    {isPlayerHost && (
                      <span className="badge badge-host" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>
                        Host
                      </span>
                    )}
                    {isCurrent && (
                      <span className="badge badge-you" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>
                        You
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Status Box & Requirements */}
        {players.length < minPlayersRequired ? (
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              backgroundColor: '#FFFBEB',
              border: '2px solid #F59E0B',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1.25rem',
              color: '#B45309',
              fontSize: '0.95rem',
              fontWeight: 500
            }}
          >
            <AlertCircle size={20} />
            <span>
              Waiting for players to join... Need at least <strong>{minPlayersRequired} players</strong> to start the game. Share the room code with friends!
            </span>
          </div>
        ) : (
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              backgroundColor: '#ECFDF5',
              border: '2px solid #10B981',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1.25rem',
              color: '#065F46',
              fontSize: '0.95rem',
              fontWeight: 500
            }}
          >
            <Check size={20} />
            <span>
              Lobby is ready! {isHost ? 'You can start the match when everyone is in.' : 'Waiting for host to start the game.'}
            </span>
          </div>
        )}
      </div>

      {/* Host Controls or Guesser Waiting Bar */}
      <div className="doodle-card" style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', textAlign: 'center' }}>
        {isHost ? (
          <div>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!canStart}
              onClick={onStartGame}
              style={{
                fontSize: '1.25rem',
                padding: '0.95rem 2.5rem',
                minWidth: '220px',
                boxShadow: canStart ? 'var(--shadow-md)' : 'none'
              }}
            >
              <Play size={22} fill="currentColor" />
              <span>Start Game</span>
            </button>
            {!canStart && (
              <p style={{ marginTop: '0.65rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                You need at least {minPlayersRequired} players in the lobby to start.
              </p>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.65rem', color: 'var(--color-text-muted)' }}>
            <span className="badge badge-ready">Waiting</span>
            <span style={{ fontSize: '1.05rem', fontWeight: 500 }}>
              The host will start the game shortly... Sit tight!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
