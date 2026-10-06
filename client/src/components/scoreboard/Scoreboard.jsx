import React from 'react';
import { Trophy, Edit3, CheckCircle2 } from 'lucide-react';

export function Scoreboard({ players, currentDrawerId }) {
  // Sort players by score descending
  const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div className="scoreboard-card">
      <div className="sidebar-header">
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Trophy size={14} color="var(--accent-amber)" /> Live Standings
        </span>
        <span>{players.length} Players</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {sortedPlayers.map((p, idx) => {
          const isDrawer = p.id === currentDrawerId;
          const hasGuessed = p.hasGuessed;

          return (
            <div
              key={p.id}
              className={`player-score-row ${isDrawer ? 'is-drawer' : ''} ${hasGuessed ? 'has-guessed' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                <span style={{ fontWeight: 700, fontSize: '0.8rem', color: idx === 0 ? 'var(--accent-amber)' : 'var(--text-muted)', width: 16 }}>
                  #{idx + 1}
                </span>
                <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
                  {p.name}
                </span>

                {isDrawer && (
                  <span title="Drawing this round" style={{ display: 'inline-flex', color: 'var(--accent-primary)' }}>
                    <Edit3 size={13} />
                  </span>
                )}
                {hasGuessed && (
                  <span title="Guessed correctly" style={{ display: 'inline-flex', color: 'var(--success)' }}>
                    <CheckCircle2 size={13} />
                  </span>
                )}
              </div>

              <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                {p.score || 0} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>pts</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Scoreboard;
