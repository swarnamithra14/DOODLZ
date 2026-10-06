import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Medal, RotateCcw, Home, Sparkles, Award } from 'lucide-react';
import { useGame } from '../context/GameContext';

export function Results() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { playerName } = useGame();

  const finalScores = [
    { rank: 1, name: playerName || 'Player1', score: 1420, isWinner: true },
    { rank: 2, name: 'Sophia', score: 1180, isWinner: false },
    { rank: 3, name: 'Marcus', score: 950, isWinner: false },
    { rank: 4, name: 'Leo', score: 620, isWinner: false },
  ];

  const first = finalScores[0];
  const second = finalScores[1];
  const third = finalScores[2];

  return (
    <main className="main-content">
      <div className="results-container">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.9rem', borderRadius: 'var(--radius-full)', background: '#FFFBEB', color: 'var(--accent-amber)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          <Sparkles size={16} />
          <span>Match Concluded</span>
        </div>

        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Final Leaderboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '2rem' }}>
          Spectacular sketching! Here are the champions for room <strong>{roomId}</strong>.
        </p>

        {/* 3-Step Podium */}
        <div className="podium-wrapper">
          {/* 2nd Place */}
          {second && (
            <div className="podium-place">
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{second.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                {second.score} pts
              </div>
              <div className="podium-box podium-2nd">
                <Medal size={28} />
                <span>2nd</span>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {first && (
            <div className="podium-place">
              <div style={{ background: '#FEF3C7', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', color: '#D97706', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                👑 Champion
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {first.name}
              </div>
              <div style={{ color: 'var(--accent-amber)', fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                {first.score} pts
              </div>
              <div className="podium-box podium-1st">
                <Trophy size={38} />
                <span>1st</span>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {third && (
            <div className="podium-place">
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{third.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                {third.score} pts
              </div>
              <div className="podium-box podium-3rd">
                <Award size={26} />
                <span>3rd</span>
              </div>
            </div>
          )}
        </div>

        {/* Complete Standings Table Card */}
        <div className="card" style={{ maxWidth: '550px', margin: '0 auto 2.5rem', textAlign: 'left' }}>
          <div className="sidebar-header" style={{ marginBottom: '1rem' }}>
            <span>Complete Scorecard</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {finalScores.map((p) => (
              <div
                key={p.rank}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  background: p.rank === 1 ? '#FFFBEB' : 'var(--bg-tertiary)',
                  border: p.rank === 1 ? '1px solid #FDE68A' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 800, width: 20, color: p.rank === 1 ? '#D97706' : 'var(--text-muted)' }}>
                    #{p.rank}
                  </span>
                  <span style={{ fontWeight: 700 }}>{p.name}</span>
                </div>
                <div style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                  {p.score} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate(`/room/${roomId}`)}
          >
            <RotateCcw size={18} />
            <span>Play Again</span>
          </button>
          <button
            className="btn btn-secondary btn-lg"
            onClick={() => navigate('/lobby')}
          >
            <Home size={18} />
            <span>Back to Lobby</span>
          </button>
        </div>
      </div>
    </main>
  );
}

export default Results;
